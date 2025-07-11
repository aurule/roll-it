const { Opposed } = require("../opposed")
const { Challenge } = require("./challenge")
const { Participant } = require("./participant")

const { OpTest } = require("./optest")

describe("OpTest", () => {
  let opposed_db

  beforeEach(() => {
    opposed_db = new Opposed()
  })

  describe("constructor", () => {
    it("coerces `retested` to a boolean", () => {
      const test_record = new OpTest({
        id: 1,
        challenge_id: 1,
        locale: "en-US",
        retested: 1,
        opposed_db,
      })

      expect(test_record.retested).toBe(true)
    })

    it("coerces `cancelled` to a boolean", () => {
      const test_record = new OpTest({
        id: 1,
        challenge_id: 1,
        locale: "en-US",
        cancelled: 1,
        opposed_db,
      })

      expect(test_record.cancelled).toBe(true)
    })

    it("leaves associated records for lazy loading", () => {
      const test_record = new OpTest({
        id: 1,
        challenge_id: 1,
        locale: "en-US",
        opposed_db,
      })

      expect(test_record.records.size).toEqual(0)
    })
  })

  describe("related records", () => {
    let challenge_id
    let test_record
    let attacker
    let defender
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeAll(() => {
      let result = opposed_db.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid

      result = opposed_db.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      })
      let attacker_id = result.lastInsertRowid
      attacker = opposed_db.getParticipant(attacker_id)

      result = opposed_db.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      })
      let defender_id = result.lastInsertRowid
      defender = opposed_db.getParticipant(defender_id)
    })

    beforeEach(() => {
      let result = opposed_db.addTest({
        challenge_id,
        locale: "en-US",
        attacker_ready: true,
        defender_ready: true,
        leader_id: attacker.id,
        retester_id: defender.id,
        canceller_id: attacker.id,
      })
      test_id = result.lastInsertRowid
      test_record = opposed_db.getTest(test_id)
    })

    describe("populateParticipants", () => {
      it("sets leader from own leader ID", () => {
        expect(test_record.records.get("leader")).toBeUndefined()

        test_record.populateParticipants()

        expect(test_record.records.get("leader").id).toEqual(attacker.id)
      })

      it("sets trailer from non-leader participant", () => {
        expect(test_record.records.get("trailer")).toBeUndefined()

        test_record.populateParticipants()

        expect(test_record.records.get("trailer").id).toEqual(defender.id)
      })

      it("sets retester from own retester ID", () => {
        expect(test_record.records.get("retester")).toBeUndefined()

        test_record.populateParticipants()

        expect(test_record.records.get("retester").id).toEqual(defender.id)
      })

      it("sets canceller from own canceller ID", () => {
        expect(test_record.records.get("canceller")).toBeUndefined()

        test_record.populateParticipants()

        expect(test_record.records.get("canceller").id).toEqual(attacker.id)
      })

      it("sets attacker based on role", () => {
        expect(test_record.records.get("attacker")).toBeUndefined()

        test_record.populateParticipants()

        expect(test_record.records.get("attacker").id).toEqual(attacker.id)
      })

      it("sets defender based on role", () => {
        expect(test_record.records.get("defender")).toBeUndefined()

        test_record.populateParticipants()

        expect(test_record.records.get("defender").id).toEqual(defender.id)
      })

      it("returns the named participant record if asked", () => {
        const participant = test_record.populateParticipants("attacker")

        expect(participant.id).toEqual(attacker.id)
      })
    })

    describe("leader", () => {
      it("gets the leader record", () => {
        expect(test_record.leader.id).toEqual(attacker.id)
      })
    })

    describe("trailer", () => {
      it("gets the trailer record", () => {
        expect(test_record.trailer.id).toEqual(defender.id)
      })
    })

    describe("retester", () => {
      it("gets the retester record", () => {
        expect(test_record.retester.id).toEqual(defender.id)
      })
    })

    describe("canceller", () => {
      it("gets the canceller record", () => {
        expect(test_record.canceller.id).toEqual(attacker.id)
      })
    })

    describe("attacker", () => {
      it("gets the attacker record", () => {
        expect(test_record.attacker.id).toEqual(attacker.id)
      })
    })

    describe("defender", () => {
      it("gets the defender record", () => {
        expect(test_record.defender.id).toEqual(defender.id)
      })
    })

    describe("challenge", () => {
      it("gets the challenge record", () => {
        expect(test_record.challenge.id).toEqual(challenge_id)
      })
    })
  })
})
