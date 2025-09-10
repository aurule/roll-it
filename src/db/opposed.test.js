const { simpleflake } = require("simpleflakes")
const { Collection } = require("discord.js")
const { makeDB } = require("./index")

const { Opposed } = require("./opposed")
const { Challenge } = require("./opposed/challenge")
const { Participant } = require("./opposed/participant")

describe("Opposed DB", () => {
  let opposed
  let db

  beforeEach(() => {
    db = makeDB()
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
        state: Challenge.States.AdvantagesAttacker,
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
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge 2",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
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
        state: Challenge.States.AdvantagesAttacker,
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
      state: Challenge.States.AdvantagesAttacker,
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

    describe("expired flag", () => {
      it("is false when expires_at is in future", () => {
        const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid

        const record = opposed.getChallenge(challenge_id)

        expect(record.expired).toBe(false)
      })

      it("is true when expires_at is in past", () => {
        const challenge_id = opposed.addChallenge({
          ...challenge_data,
          timeout: -1000,
        }).lastInsertRowid

        const record = opposed.getChallenge(challenge_id)

        expect(record.expired).toBe(true)
      })
    })
  })

  describe("getChallengeWithParticipants", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: Challenge.States.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }
    const attacker_data = {
      user_uid: "attacker",
      mention: "<@attacker>",
      role: Participant.Roles.Attacker,
    }
    const defender_data = {
      user_uid: "defender",
      mention: "<@defender>",
      role: Participant.Roles.Defender,
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
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      opposed.setChallengeState(challenge_id, Challenge.States.Relented)

      const record = opposed.getChallenge(challenge_id)
      expect(record.state).toEqual(Challenge.States.Relented)
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
        state: Challenge.States.AdvantagesAttacker,
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
        state: Challenge.States.AdvantagesAttacker,
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
      state: Challenge.States.AdvantagesAttacker,
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
        state: Challenge.States.AdvantagesAttacker,
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
      opposed.setChallengeState(challenge_id, Challenge.States.Cancelling)

      const result = opposed.challengeFromMessageIsFinalized(message_uid)

      expect(result).toEqual(false)
    })

    it.each(Array.from(Challenge.FinalStates).map((s) => [s]))(
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
      state: Challenge.States.AdvantagesAttacker,
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
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid
      const attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid
      const defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: defender_uid,
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
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
      state: Challenge.States.AdvantagesAttacker,
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
      state: Challenge.States.AdvantagesAttacker,
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

  describe("getMessage", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: Challenge.States.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }
    let message_id

    beforeEach(() => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      message_id = opposed.addMessage({
        message_uid: "test message",
        challenge_id,
      }).lastInsertRowid
    })

    it("gets the message for the id", () => {
      const result = opposed.getMessage(message_id)

      expect(result.message_uid).toEqual("test message")
    })

    it("returns undefined for unknown ID", () => {
      const result = opposed.getMessage(55)

      expect(result).toBeUndefined()
    })
  })

  describe("hasMessage", () => {
    const challenge_data = {
      locale: "en-US",
      description: "testing challenge",
      attacker_uid: "atk",
      attribute: "mental",
      retest_ability: "occult",
      state: Challenge.States.AdvantagesAttacker,
      channel_uid: "testchan",
      timeout: 1000,
    }
    let message_id

    beforeEach(() => {
      const challenge_id = opposed.addChallenge(challenge_data).lastInsertRowid
      message_id = opposed.addMessage({
        message_uid: "test message",
        challenge_id,
      }).lastInsertRowid
    })

    it("returns true if the uid exists", () => {
      const result = opposed.hasMessage("test message")

      expect(result).toBe(true)
    })

    it("returns false if the uid does not exist", () => {
      const result = opposed.hasMessage("nope")

      expect(result).toBe(false)
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
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid

      result = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      })
      attacker_id = result.lastInsertRowid
      result = opposed.addParticipant({
        challenge_id,
        user_uid: defender_uid,
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
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
        state: Challenge.States.AdvantagesAttacker,
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
        role: Participant.Roles.Defender,
        advantages: [],
        challenge_id,
      })

      expect(opposed.participantCount(challenge_id)).toEqual(1)
    })

    it("encodes the advantages", () => {
      const result = opposed.addParticipant({
        user_uid: "test",
        mention: "<@test>",
        role: Participant.Roles.Defender,
        advantages: ["ties"],
        challenge_id,
      })

      const record = opposed.getParticipant(result.lastInsertRowid)
      expect(record.advantages).toContain("ties")
    })
  })

  describe("participantCount", () => {
    let challenge_id

    beforeEach(() => {
      const result = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      })
      challenge_id = result.lastInsertRowid
    })

    it("returns zero with no participants", () => {
      const result = opposed.participantCount(challenge_id)

      expect(result).toEqual(0)
    })

    it("returns 1 with one participant", () => {
      opposed.addParticipant({
        user_uid: "atk",
        mention: "<@atk>",
        advantages: [],
        challenge_id,
        role: Participant.Roles.Attacker,
      })

      const result = opposed.participantCount(challenge_id)

      expect(result).toEqual(1)
    })

    it("returns 2 with two participants", () => {
      opposed.addParticipant({
        user_uid: "atk",
        mention: "<@atk>",
        advantages: [],
        challenge_id,
        role: Participant.Roles.Attacker,
      })
      opposed.addParticipant({
        user_uid: "def",
        mention: "<@def>",
        advantages: [],
        challenge_id,
        role: Participant.Roles.Defender,
      })

      const result = opposed.participantCount(challenge_id)

      expect(result).toEqual(2)
    })
  })

  describe("getParticipant", () => {
    let challenge_id
    let participant_id

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid
      participant_id = opposed.addParticipant({
        challenge_id,
        user_uid: "atk",
        mention: `<@atk>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid
    })

    it("returns undefined for unknown id", () => {
      const result = opposed.getParticipant(55)

      expect(result).toBeUndefined()
    })

    it("gets the record", () => {
      const result = opposed.getParticipant(participant_id)

      expect(result.user_uid).toEqual("atk")
    })

    it("converts advantages from json", () => {
      const result = opposed.getParticipant(participant_id)

      expect(result.advantages).toEqual(["hi", "there"])
    })
  })

  describe("getParticipants", () => {
    let challenge_id
    let attacker_id
    let defender_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      const result = opposed.addChallenge({
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

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid

      defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid
    })

    it("indexes by attacker/defender by default", () => {
      const result = opposed.getParticipants(challenge_id)

      expect(result.get("attacker").user_uid).toEqual(attacker_uid)
      expect(result.get("defender").user_uid).toEqual(defender_uid)
    })

    it("indexes by ID when requested", () => {
      const result = opposed.getParticipants(challenge_id, true)

      expect(result.get(attacker_id).user_uid).toEqual(attacker_uid)
      expect(result.get(defender_id).user_uid).toEqual(defender_uid)
    })

    it("extracts advantages", () => {
      const result = opposed.getParticipants(challenge_id)

      expect(result.get("attacker").advantages).toContain("hi")
      expect(result.get("attacker").advantages).toContain("there")
    })
  })

  describe("setParticipantAdvantages", () => {
    let challenge_id
    let attacker_id
    const attacker_uid = "atk"

    beforeEach(() => {
      const result = opposed.addChallenge({
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

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid
    })

    it("saves the new advantages", () => {
      opposed.setParticipantAdvantages(attacker_id, ["new", "things"])

      const participant = opposed.getParticipant(attacker_id)
      expect(participant.advantages).toEqual(["new", "things"])
    })
  })

  describe("setParticipantAbilityUsed", () => {
    let challenge_id
    let attacker_id
    const attacker_uid = "atk"

    beforeEach(() => {
      const result = opposed.addChallenge({
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

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
        ability_used: false,
      }).lastInsertRowid
    })

    it("updates the ability_used flag to true by default", () => {
      opposed.setParticipantAbilityUsed(attacker_id)

      const participant = opposed.getParticipant(attacker_id)
      expect(participant.ability_used).toBe(true)
    })

    it("updates the ability_used flag to false by request", () => {
      opposed.setParticipantAbilityUsed(attacker_id, false)

      const participant = opposed.getParticipant(attacker_id)
      expect(participant.ability_used).toBe(false)
    })
  })

  describe("setTieWinner", () => {
    let challenge_id
    let attacker_id
    const attacker_uid = "atk"

    beforeEach(() => {
      const result = opposed.addChallenge({
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

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
        tie_winner: false,
      }).lastInsertRowid
    })

    it("updates the tie_winner flag to true by default", () => {
      opposed.setTieWinner(attacker_id)

      const participant = opposed.getParticipant(attacker_id)
      expect(participant.tie_winner).toBe(true)
    })

    it("updates the tie_winner flag to false by request", () => {
      opposed.setTieWinner(attacker_id, false)

      const participant = opposed.getParticipant(attacker_id)
      expect(participant.tie_winner).toBe(false)
    })
  })

  describe("getTieWinner", () => {
    let challenge_id
    let attacker_id
    let defender_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      const result = opposed.addChallenge({
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

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid

      defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid
    })

    it("with a winner, returns the winning participant", () => {
      opposed.setTieWinner(attacker_id, true)

      const result = opposed.getTieWinner(challenge_id)

      expect(result.id).toEqual(attacker_id)
    })

    it("with no winner, returns null", () => {
      const result = opposed.getTieWinner(challenge_id)

      expect(result).toBeNull()
    })

    it("with bad challenge ID, returns null", () => {
      const result = opposed.getTieWinner(55)

      expect(result).toBeNull()
    })
  })

  describe("addTest", () => {
    let challenge_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      })

      opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      })
    })

    it("stores retested flag", () => {
      const test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        retested: true,
      }).lastInsertRowid

      const record = opposed.getTest(test_id)

      expect(record.retested).toBe(true)
    })

    it("stores cancelled flag", () => {
      const test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        cancelled: true,
      }).lastInsertRowid

      const record = opposed.getTest(test_id)

      expect(record.cancelled).toBe(true)
    })
  })

  describe("addFutureTest", () => {
    let challenge_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      })

      opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      })
    })

    it("overrides created_at", () => {
      const test_id = opposed.addFutureTest({
        challenge_id,
        locale: "en-US",
        gap: 60000,
      }).lastInsertRowid

      const record = opposed.getTest(test_id)
      expect(new Date(record.created_at).valueOf()).toBeGreaterThan(Date.now())
    })
  })

  describe("testCount", () => {
    let challenge_id

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      opposed.addTest({
        challenge_id,
        locale: "en-US",
      })
    })

    it("returns number of associated tests", () => {
      const result = opposed.testCount(challenge_id)

      expect(result).toEqual(1)
    })
  })

  describe("getTest", () => {
    let challenge_id
    let test_id

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid
    })

    it("gets the test record", () => {
      const result = opposed.getTest(test_id)

      expect(result.challenge_id).toEqual(challenge_id)
    })
  })

  describe("findTestByMessage", () => {
    let test_id
    let message_uid

    beforeEach(() => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid

      message_uid = simpleflake()
      opposed.addMessage({
        message_uid,
        challenge_id,
        test_id,
      })
    })

    describe("with unknown message", () => {
      it("returns null test", () => {
        const result = opposed.findTestByMessage("asdf")

        expect(result.id).toBeUndefined()
      })
    })

    it("gets the test for that message", () => {
      const result = opposed.findTestByMessage(message_uid)

      expect(result.id).toEqual(test_id)
    })
  })

  describe("getLatestTest", () => {
    let challenge_id
    let test_id

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid
    })

    it("gets the most recent test record", () => {
      opposed.addTest({
        challenge_id,
        locale: "en-US",
        created_at: "2025-06-01T13:00:00-04:00",
      })

      const test_record = opposed.getLatestTest(challenge_id)

      expect(test_record.id).toEqual(test_id)
    })
  })

  describe("setTestRetested", () => {
    let retest_id
    let test_id

    beforeEach(() => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid

      retest_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        retested: true,
      }).lastInsertRowid
    })

    it("sets retested flag as requested", () => {
      opposed.setTestRetested(retest_id, false)

      const record = opposed.getTest(retest_id)
      expect(record.retested).toBe(false)
    })

    it("sets retested true by default", () => {
      opposed.setTestRetested(test_id)

      const record = opposed.getTest(test_id)
      expect(record.retested).toBe(true)
    })
  })

  describe("setTestRetestReason", () => {
    let test_id

    beforeEach(() => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid
    })

    it("sets retest reason", () => {
      opposed.setTestRetestReason(test_id, "something")

      const record = opposed.getTest(test_id)
      expect(record.retest_reason).toMatch("something")
    })
  })

  describe("setTestCancelled", () => {
    let retest_id
    let test_id

    beforeEach(() => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        cancelled: false,
      }).lastInsertRowid
    })

    it("sets cancelled true", () => {
      opposed.setTestCancelled(test_id)

      const record = opposed.getTest(test_id)
      expect(record.cancelled).toBe(true)
    })
  })

  describe("setTestCancelledWith", () => {
    let test_id

    beforeEach(() => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid
    })

    it("sets retest reason", () => {
      opposed.setTestCancelledWith(test_id, "something")

      const record = opposed.getTest(test_id)
      expect(record.cancelled_with).toMatch("something")
    })
  })

  describe("setTestLeader", () => {
    let challenge_id
    let attacker_id
    let defender_id
    let test_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid

      defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        leader_id: defender_id,
      }).lastInsertRowid
    })

    it("updates the ID of the leading participant", () => {
      opposed.setTestLeader(test_id, attacker_id)

      const record = opposed.getTest(test_id)
      expect(record.leader_id).toEqual(attacker_id)
    })
  })

  describe("setTestBreakdown", () => {
    let test_id

    beforeEach(() => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid
    })

    it("sets retest reason", () => {
      opposed.setTestBreakdown(test_id, "something")

      const record = opposed.getTest(test_id)
      expect(record.breakdown).toMatch("something")
    })
  })

  describe("setTestHistory", () => {
    let test_id

    beforeEach(() => {
      const challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid: "atk",
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
      }).lastInsertRowid
    })

    it("sets retest reason", () => {
      opposed.setTestHistory(test_id, "something")

      const record = opposed.getTest(test_id)
      expect(record.history).toMatch("something")
    })
  })

  describe("setRetest", () => {
    let challenge_id
    let attacker_id
    let defender_id
    let test_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid

      defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        leader_id: defender_id,
      }).lastInsertRowid
    })

    it("sets the retester id", () => {
      opposed.setRetest({
        test_id,
        retester_id: attacker_id,
        reason: "ability",
        canceller_id: defender_id,
      })

      const record = opposed.getTest(test_id)
      expect(record.retester_id).toEqual(attacker_id)
    })

    it("sets the canceller id", () => {
      opposed.setRetest({
        test_id,
        retester_id: attacker_id,
        reason: "ability",
        canceller_id: defender_id,
      })

      const record = opposed.getTest(test_id)
      expect(record.canceller_id).toEqual(defender_id)
    })

    it("sets the retest reason", () => {
      opposed.setRetest({
        test_id,
        retester_id: attacker_id,
        reason: "ability",
        canceller_id: defender_id,
      })

      const record = opposed.getTest(test_id)
      expect(record.retest_reason).toMatch("ability")
    })
  })

  describe("addChopRequest", () => {
    let challenge_id
    let attacker_id
    let defender_id
    let test_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid

      defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        leader_id: defender_id,
      }).lastInsertRowid
    })

    it("stores the chop request", () => {
      const chop_id = opposed.addChopRequest({
        request: "rock",
        participant_id: attacker_id,
        test_id,
      }).lastInsertRowid

      const record = opposed.getChop(chop_id)
      expect(record.request).toMatch("rock")
    })
  })

  describe("getChop", () => {
    let challenge_id
    let attacker_id
    let defender_id
    let test_id
    let chop_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid

      defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        leader_id: defender_id,
      }).lastInsertRowid

      chop_id = opposed.addChopRequest({
        request: "rock",
        test_id,
        participant_id: attacker_id,
      }).lastInsertRowid
    })

    it("gets the record", () => {
      const record = opposed.getChop(chop_id)

      expect(record.id).toEqual(chop_id)
    })

    it("returns boolean for ready flag", () => {
      const record = opposed.getChop(chop_id)

      expect(record.ready).toBe(false)
    })

    it("returns boolean for tie_accepted flag", () => {
      const record = opposed.getChop(chop_id)

      expect(record.tie_accepted).toBe(false)
    })
  })

  describe("getChopsForTest", () => {
    let challenge_id
    let attacker_id
    let defender_id
    let test_id
    let attacker_chop_id
    let defender_chop_id
    const attacker_uid = "atk"
    const defender_uid = "def"

    beforeEach(() => {
      challenge_id = opposed.addChallenge({
        locale: "en-US",
        description: "testing challenge",
        attacker_uid,
        attribute: "mental",
        retest_ability: "occult",
        state: Challenge.States.AdvantagesAttacker,
        channel_uid: "testchan",
        timeout: 1000,
      }).lastInsertRowid

      attacker_id = opposed.addParticipant({
        challenge_id,
        user_uid: attacker_uid,
        mention: `<@${attacker_uid}>`,
        role: Participant.Roles.Attacker,
        advantages: ["hi", "there"],
      }).lastInsertRowid

      defender_id = opposed.addParticipant({
        challenge_id,
        user_uid: "def",
        mention: `<@${defender_uid}>`,
        role: Participant.Roles.Defender,
        advantages: ["oh", "no"],
      }).lastInsertRowid

      test_id = opposed.addTest({
        challenge_id,
        locale: "en-US",
        leader_id: defender_id,
      }).lastInsertRowid

      attacker_chop_id = opposed.addChopRequest({
        request: "rock",
        test_id,
        participant_id: attacker_id,
      }).lastInsertRowid

      defender_chop_id = opposed.addChopRequest({
        request: "rock",
        test_id,
        participant_id: defender_id,
      }).lastInsertRowid
    })

    it("gets both records", () => {
      const records = opposed.getChopsForTest(test_id)

      expect(records.length).toEqual(2)
    })

    it("returns boolean for ready flag", () => {
      const records = opposed.getChopsForTest(test_id)

      expect(records[0].ready).toBe(false)
    })

    it("returns boolean for tie_accepted flag", () => {
      const records = opposed.getChopsForTest(test_id)

      expect(records[0].tie_accepted).toBe(false)
    })
  })
})
