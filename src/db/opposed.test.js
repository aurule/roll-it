const { Collection } = require("discord.js")
const { makeDB } = require("./index")

const { Opposed, ParticipantRoles, ChallengeStates } = require("./opposed")

let db

beforeEach(() => {
  db = makeDB()
})

describe("Opposed DB", () => {
  let opposed

  beforeEach(() => {
    opposed = new Opposed(db)
  })

  describe("addParticipant", () => {
    let challenge_id
    const attacker_uid = "atk"

    beforeEach(() => {
      const result = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retests_allowed: true,
        retest_ability: "occult",
        state: ChallengeStates.Advantages,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid
    })

    it("adds a participant record", () => {
      expect(opposed.participantCount(challenge_id)).toEqual(0)

      opposed.addParticipant({
        user_uid: "test",
        mention: "<@test>",
        role: ParticipantRoles.Defender,
        advantages: [],
        challenge_id,
      })

      expect(opposed.participantCount(challenge_id)).toEqual(1)
    })

    it("encodes the advantages", () => {
      const result = opposed.addParticipant({
        user_uid: "test",
        mention: "<@test>",
        role: ParticipantRoles.Defender,
        advantages: ["ties"],
        challenge_id,
      })

      const record = opposed.getParticipant(result.lastInsertRowid)
      expect(record.advantages).toContain("ties")
    })
  })

  describe("getParticipants", () => {
    let challenge_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      const result = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retests_allowed: true,
        retest_ability: "occult",
        state: ChallengeStates.Advantages,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid

      opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: ParticipantRoles.Attacker,
        advantages: ['hi', 'there'],
      })
      opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: ParticipantRoles.Defender,
        advantages: ['oh', 'no'],
      })
    })

    it("uses the correct keys", () => {
      const result = opposed.getParticipants(challenge_id)

      expect(result.get("attacker").user_uid).toEqual(attacker_uid)
      expect(result.get("defender").user_uid).toEqual(defender_uid)
    })

    it("extracts advantages", () => {
      const result = opposed.getParticipants(challenge_id)

      expect(result.get("attacker").advantages).toContain("hi")
      expect(result.get("attacker").advantages).toContain("there")
    })
  })

  describe("getLatestTestWithParticipants", () => {
    let challenge_id
    let attacker_id
    let defender_id
    let test_id
    let participant_ids
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      let result = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retests_allowed: true,
        retest_ability: "occult",
        state: ChallengeStates.Advantages,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid

      result = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: ParticipantRoles.Attacker,
        advantages: ['hi', 'there'],
      })
      attacker_id = result.lastInsertRowid
      result = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: ParticipantRoles.Defender,
        advantages: ['oh', 'no'],
      })
      defender_id = result.lastInsertRowid
      participant_ids = new Collection([
        ["attacker", attacker_id],
        ["defender", defender_id],
      ])

      result = opposed.addTest({
        challenge_id,
        locale: "en-US",
        attacker_ready: true,
        defender_ready: true,
        leader_id: attacker_id,
        retester_id: defender_id,
        canceller_id: attacker_id,
      })
      test_id = result.lastInsertRowid
    })

    it("gets the most recent test record", () => {
      opposed.addTest({
        challenge_id,
        locale: "en-US",
        attacker_ready: true,
        defender_ready: true,
        leader_id: attacker_id,
        created_at: "2025-06-01T13:00:00-04:00",
      })

      const test_record = opposed.getLatestTestWithParticipants(challenge_id)

      expect(test_record.id).toEqual(test_id)
    })

    it.each([
      ["leader", "attacker"],
      ["trailer", "defender"],
      ["retester", "defender"],
      ["canceller", "attacker"],
    ])("includes the %s record", (child_name, role) => {
      const child_id = participant_ids.get(role)

      const test_record = opposed.getLatestTestWithParticipants(challenge_id)

      expect(test_record[child_name].id).toEqual(child_id)
    })
  })
})
