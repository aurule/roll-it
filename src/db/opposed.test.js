const { makeDB } = require("./index")

const { Opposed, ParticipantRoles } = require("./opposed")

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
        attacker_uid,
        attribute: "mental",
        description: "testing challenge",
        retests_allowed: true,
        retest_ability: "occult",
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
        attacker_uid,
        attribute: "mental",
        description: "testing challenge",
        retests_allowed: true,
        retest_ability: "occult",
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

      expect(result.attacker.user_uid).toEqual(attacker_uid)
      expect(result.defender.user_uid).toEqual(defender_uid)
    })

    it("extracts advantages", () => {
      const result = opposed.getParticipants(challenge_id)

      expect(result.attacker.advantages).toContain("hi")
      expect(result.attacker.advantages).toContain("there")
    })
  })
})
