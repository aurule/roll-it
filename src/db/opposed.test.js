const { Collection } = require("discord.js")
const { makeDB } = require("./index")

const { Opposed, ParticipantRoles, ChallengeStates, FINAL_STATES, sanitizeChallenge } = require("./opposed")

let db

beforeEach(() => {
  db = makeDB()
})

describe("sanitizeChallenge", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: ChallengeStates.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
      expired: 0,
      conditions: JSON.stringify(["altering"]),
    }

    it("makes expired a boolean", () => {
      const result = sanitizeChallenge(challenge_data)

      expect(result.expired).toBe(false)
    })

    it("makes conditions an array", () => {
      const result = sanitizeChallenge(challenge_data)

      expect(result.conditions).toEqual(["altering"])
    })
})

describe("Opposed DB", () => {
  let opposed

  beforeEach(() => {
    opposed = new Opposed(db)
  })

  describe("addChallenge", () => {
    it("adds a new challenge record", () => {
      opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })

      expect(opposed.challengeCount()).toEqual(1)
    })
  })

  describe("challengeCount", () => {
    it("gets the total number of records", () => {
      opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge 2",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })

      const result = opposed.challengeCount()

      expect(result).toEqual(2)
    })
  })

  describe("destroy", () => {
    it("removes the given challenge", () => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      opposed.destroy(challenge_id)

      expect(opposed.challengeCount()).toEqual(0)
    })
  })

  describe("getChallenge", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: ChallengeStates.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }

    it("returns undefined for bad id", () => {
      const result = opposed.getChallenge(25)

      expect(result).toBeUndefined()
    })

    it("gets the record", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid

      const result = opposed.getChallenge(challenge_id)

      expect(result.description).toEqual("testing challenge")
    })
  })

  describe("getChallengeWithParticipants", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: ChallengeStates.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }
    const attacker_data = {
      user_uid: "attacker",
      mention: "<@attacker>",
      role: ParticipantRoles.Attacker,
    }
    const defender_data = {
      user_uid: "defender",
      mention: "<@defender>",
      role: ParticipantRoles.Defender,
    }

    it("returns undefined for bad id", () => {
      const result = opposed.getChallengeWithParticipants(25)

      expect(result).toBeUndefined()
    })

    it("gets the record", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      const attacker_id = opposed.addParticipant({
        ...attacker_data,
        challenge_id,
      }).lastInsertRowid
      const defender_id = opposed.addParticipant({
        ...defender_data,
        challenge_id,
      }).lastInsertRowid

      const result = opposed.getChallengeWithParticipants(challenge_id)

      expect(result.description).toEqual("testing challenge")
    })

    it("populates attacker record", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      const attacker_id = opposed.addParticipant({
        ...attacker_data,
        challenge_id,
      }).lastInsertRowid
      const defender_id = opposed.addParticipant({
        ...defender_data,
        challenge_id,
      }).lastInsertRowid

      const result = opposed.getChallengeWithParticipants(challenge_id)

      expect(result.attacker.id).toEqual(attacker_id)
    })

    it("populates defender record", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      const attacker_id = opposed.addParticipant({
        ...attacker_data,
        challenge_id,
      }).lastInsertRowid
      const defender_id = opposed.addParticipant({
        ...defender_data,
        challenge_id,
      }).lastInsertRowid

      const result = opposed.getChallengeWithParticipants(challenge_id)

      expect(result.defender.id).toEqual(defender_id)
    })
  })

  describe("setChallengeState", () => {
    it("changes the challenge's state", () => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      opposed.setChallengeState(challenge_id, ChallengeStates.Relented)

      const record = opposed.getChallenge(challenge_id)
      expect(record.state).toEqual(ChallengeStates.Relented)
    })
  })

  describe("setChallengeSummary", () => {
    it("changes the challenge's summary", () => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      opposed.setChallengeSummary(challenge_id, "summary here")

      const record = opposed.getChallenge(challenge_id)
      expect(record.summary).toEqual("summary here")
    })
  })

  describe("setChallengeConditions", () => {
    it("changes the challenge's conditions", () => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
        conditions: ["carrier"],
      }).lastInsertRowid

      opposed.setChallengeConditions(challenge_id, ["altering"])

      const record = opposed.getChallenge(challenge_id)
      expect(record.conditions).toEqual(["altering"])
    })
  })

  describe("findChallengeByMessage", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: ChallengeStates.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }

    it("returns undefined for bad message_uid", () => {
      const result = opposed.findChallengeByMessage("asdf")

      expect(result).toBeUndefined()
    })

    it("gets the associated challenge record", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      opposed.addMessage({
        message_uid: "test message",
        challenge_id,
      })

      const result = opposed.findChallengeByMessage("test message")

      expect(result.id).toEqual(challenge_id)
    })
  })

  describe("challengeFromMessageIsFinalized", () => {
    let challenge_id
    const message_uid = "msg"

    beforeEach(() => {
      const result = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid
      opposed.addMessage({
        message_uid,
        challenge_id,
      })
    })

    it("returns false for in progress states", () => {
      opposed.setChallengeState(challenge_id, ChallengeStates.Cancelling)

      const result = opposed.challengeFromMessageIsFinalized(message_uid)

      expect(result).toEqual(false)
    })

    it.each(Array.from(FINAL_STATES).map((s) => [s]))(
      "returns true for final state '%s'",
      (state) => {
        opposed.setChallengeState(challenge_id, state)

        const result = opposed.challengeFromMessageIsFinalized(message_uid)

        expect(result).toEqual(true)
      },
    )
  })

  describe("challengeFromMessageIsExpired", () => {
    const message_uid = "msg"
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: ChallengeStates.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }

    it("returns false for message with future expiration date", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      opposed.addMessage({
        message_uid,
        challenge_id,
      })

      const result = opposed.challengeFromMessageIsExpired(message_uid)

      expect(result).toEqual(false)
    })

    it("returns true for message with past expiration date", () => {
      const challenge_id = opposed.addChallenge({
        ...challenge_data,
        timeout: -1000,
      }).lastInsertRowid
      opposed.addMessage({
        message_uid,
        challenge_id,
      })

      const result = opposed.challengeFromMessageIsExpired(message_uid)

      expect(result).toEqual(true)
    })
  })

  describe("findChallengeByTest", () => {
    it("returns undefined for bad test id", () => {
      const result = opposed.findChallengeByTest(125)

      expect(result).toBeUndefined()
    })

    it("returns the challenge record", () => {
      const attacker_uid = "attacker"
      const defender_uid = "defender"
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid
      const attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: ParticipantRoles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid
      const defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: defender_uid,
        mention: `<@${defender_uid}>`,
        role: ParticipantRoles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid
      const test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid

      const record = opposed.findChallengeByTest(test_id)

      expect(record.id).toEqual(challenge_id)
    })
  })

  describe("getChallengeHistory", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: ChallengeStates.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }

    it("returns empty array for bad id", () => {
      const result = opposed.getChallengeHistory(90)

      expect(result).toEqual([])
    })

    it("gets all test history strings", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      opposed.addTest({
        challenge_id,
        locale: challenge_data.locale,
        history: "first test",
      })
      opposed.addTest({
        challenge_id,
        locale: challenge_data.locale,
        history: "second test",
      })

      const result = opposed.getChallengeHistory(challenge_id)

      expect(result).toContain("first test")
      expect(result).toContain("second test")
    })

    it("orders strings from earliest to latest", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      opposed.addTest({
        challenge_id,
        locale: challenge_data.locale,
        history: "first test",
      })
      opposed.addFutureTest({
        challenge_id,
        locale: challenge_data.locale,
        history: "second test",
      })

      const result = opposed.getChallengeHistory(challenge_id)

      expect(result[0]).toEqual("first test")
      expect(result[1]).toEqual("second test")
    })
  })

  describe("addMessage", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: ChallengeStates.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }

    it("creates a new message record", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid

      opposed.addMessage({
        message_uid: "test message",
        challenge_id,
      })

      expect(opposed.hasMessage("test message")).toBe(true)
    })

    it("links to the challenge", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      const message_id = opposed.addMessage({
        message_uid: "test message",
        challenge_id,
      }).lastInsertRowid

      const record = opposed.getMessage(message_id)

      expect(record.challenge_id).toEqual(challenge_id)
    })

    it("links to the challenge", () => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      const test_id = opposed.addTest({
        challenge_id,
        locale: challenge_data.locale,
      }).lastInsertRowid
      const message_id = opposed.addMessage({
        message_uid: "test message",
        challenge_id,
        test_id,
      }).lastInsertRowid

      const record = opposed.getMessage(message_id)

      expect(record.test_id).toEqual(test_id)
    })
  })

  describe("messageIsForLatestTest", () => {
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
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid

      result = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: ParticipantRoles.Attacker,
        advantages: ["hi", "there"],
      })
      attacker_id = result.lastInsertRowid
      result = opposed.addParticipant({
        challenge_id,
        user_uid: defender_uid,
        mention: `<@${defender_uid}>`,
        role: ParticipantRoles.Defender,
        advantages: ["oh", "no"],
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

    describe("with no linked test", () => {
      it("returns true", () => {
        const message_uid = "unlinked"
        opposed.addMessage({
          message_uid,
          challenge_id,
        })

        const result = opposed.messageIsForLatestTest(message_uid)

        expect(result).toEqual(true)
      })
    })

    describe("with a linked test", () => {
      let old_test_id

      beforeEach(() => {
        old_test_id = opposed.addTest({
          challenge_id,
          locale: "en-US",
          attacker_ready: true,
          defender_ready: true,
          leader_id: attacker_id,
          created_at: "2025-06-01T13:00:00-04:00",
        }).lastInsertRowid
      })

      it("returns false if test is not most recent", () => {
        const message_uid = "older"
        opposed.addMessage({
          message_uid,
          challenge_id,
          test_id: old_test_id,
        })

        const result = opposed.messageIsForLatestTest(message_uid)

        expect(result).toEqual(false)
      })

      it("returns true if test is most recent", () => {
        const message_uid = "newest"
        opposed.addMessage({
          message_uid,
          test_id,
          challenge_id,
        })

        const result = opposed.messageIsForLatestTest(message_uid)

        expect(result).toEqual(true)
      })
    })
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
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
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
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid

      opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: ParticipantRoles.Attacker,
        advantages: ["hi", "there"],
      })
      opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: ParticipantRoles.Defender,
        advantages: ["oh", "no"],
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
        retest_ability: "occult",
        state: ChallengeStates.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid

      result = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: ParticipantRoles.Attacker,
        advantages: ["hi", "there"],
      })
      attacker_id = result.lastInsertRowid
      result = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: ParticipantRoles.Defender,
        advantages: ["oh", "no"],
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
