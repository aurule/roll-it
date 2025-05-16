const { makeDB } = require("./index")

const { Teamwork, MessageType, Opposed, ParticipantRoles } = require("./interactive")

let db

beforeEach(() => {
  db = makeDB()
})

describe("Teamwork DB", () => {
  let teamwork

  beforeEach(() => {
    teamwork = new Teamwork(db)
  })

  describe("addTeamwork", () => {
    it("creates a new record", () => {
      const result = teamwork.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
        timeout: 1000,
      })

      expect(result.lastInsertRowid).toBeGreaterThan(0)
    })

    it("inserts options json", () => {
      const original_options = {
        yes: true,
      }

      const result = teamwork.addTeamwork({
        command: "test",
        options: original_options,
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
        timeout: 1000,
      })

      const detail = teamwork.detail(result.lastInsertRowid)
      expect(detail.options).toMatchObject(original_options)
    })

    it("inserts expiration timestamp", () => {
      const result = teamwork.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
        timeout: -1, // force past expiry
      })

      const record = teamwork.detail(result.lastInsertRowid)
      expect(record.expired).toBeTruthy()
    })
  })

  describe("detail", () => {
    it("returns undefined with no record", () => {
      const result = teamwork.detail(54321)

      expect(result).toBeUndefined()
    })

    it("retrieves options json", () => {
      const original_options = {
        yes: true,
      }
      const result = teamwork.addTeamwork({
        command: "test",
        options: original_options,
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      })

      const detail = teamwork.detail(result.lastInsertRowid)

      expect(detail.options).toMatchObject(original_options)
    })
  })

  describe("destroy", () => {
    it("deletes the record", () => {
      const result = teamwork.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      })
      const record_id = result.lastInsertRowid

      teamwork.destroy(record_id)

      const detail = teamwork.detail(record_id)

      expect(detail).toBeUndefined()
    })
  })

  describe("addMessage", () => {
    it("creates a new message record", () => {
      const tw_record = teamwork.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      })
      const test_id = tw_record.lastInsertRowid

      const result = teamwork.addMessage({
        message_uid: "test",
        teamwork_id: test_id,
      })

      expect(result.lastInsertRowid).toBeGreaterThan(0)
    })
  })

  describe("isMessageExpired", () => {
    it("returns false when test expires in the future", () => {
      const tw_record = teamwork.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
        timeout: 120,
      })
      const test_id = tw_record.lastInsertRowid
      teamwork.addMessage({
        message_uid: "test",
        teamwork_id: test_id,
      })

      const result = teamwork.isMessageExpired("test")

      expect(result).toEqual(false)
    })

    it("returns false with no records", () => {
      const result = teamwork.isMessageExpired("test")

      expect(result).toEqual(false)
    })

    it("returns true when test expires in the past", () => {
      const tw_record = teamwork.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
        timeout: -120,
      })
      const test_id = tw_record.lastInsertRowid
      teamwork.addMessage({
        message_uid: "test2",
        teamwork_id: test_id,
      })

      const result = teamwork.isMessageExpired("test2")

      expect(result).toEqual(true)
    })
  })

  describe("hasMessage", () => {
    it("returns true when message exists", () => {
      const tw_record = teamwork.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      })
      const test_id = tw_record.lastInsertRowid
      teamwork.addMessage({
        message_uid: "test",
        teamwork_id: test_id,
      })

      const result = teamwork.hasMessage("test")

      expect(result).toEqual(true)
    })

    it("returns falsewhen message does not exist", () => {
      const result = teamwork.hasMessage("australia")

      expect(result).toEqual(false)
    })
  })

  describe("getPromptUid", () => {
    it("gets the message snowflake for the test's prompt message", () => {
      const tw_record = teamwork.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      })
      const test_id = tw_record.lastInsertRowid
      teamwork.addMessage({
        message_uid: "normal",
        teamwork_id: test_id,
      })
      const prompt_record = teamwork.addMessage({
        message_uid: "prompt",
        teamwork_id: test_id,
        type: MessageType.Prompt,
      })

      const result = teamwork.getPromptUid(test_id)

      expect(result).toEqual("prompt")
    })
  })

  describe("findTestByMessage", () => {
    it("returns undefined with missing message", () => {
      const result = teamwork.findTestByMessage("flumph")

      expect(result).toBeUndefined()
    })

    it("returns test record", () => {
      const tw_data = {
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      }
      const tw_record = teamwork.addTeamwork(tw_data)
      const test_id = tw_record.lastInsertRowid
      teamwork.addMessage({
        message_uid: "normal",
        teamwork_id: test_id,
      })

      const result = teamwork.findTestByMessage("normal")

      expect(result).toMatchObject({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channel_uid: "channel",
        description: "description",
      })
    })
  })

  describe("getFinalSumByMessage", () => {
    it("returns undefined with missing message", () => {
      const result = teamwork.getFinalSumByMessage("flumph")

      expect(result).toBeUndefined()
    })

    it("sums dice of all participants", () => {
      const tw_data = {
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      }
      const tw_record = teamwork.addTeamwork(tw_data)
      const test_id = tw_record.lastInsertRowid
      teamwork.addMessage({
        message_uid: "normal",
        teamwork_id: test_id,
      })
      teamwork.setDice(test_id, "user1", 1)
      teamwork.setDice(test_id, "user2", 2)
      teamwork.setDice(test_id, "user3", 3)

      const result = teamwork.getFinalSumByMessage("normal")

      expect(result).toEqual(6)
    })
  })

  describe("addHelper", () => {
    it("creates a helper record", () => {
      const tw_data = {
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      }
      const tw_record = teamwork.addTeamwork(tw_data)
      const test_id = tw_record.lastInsertRowid

      const result = teamwork.addHelper({
        teamwork_id: test_id,
        userId: "test_user",
      })

      expect(result.lastInsertRowid).toBeGreaterThan(0)
    })
  })

  describe("setRequestedHelpers", () => {
    describe("with no helpers", () => {
      it("adds helpers", () => {
        const tw_data = {
          command: "test",
          options: {},
          leader: "leader",
          locale: "en-US",
          channelId: "channel",
          description: "description",
        }
        const tw_record = teamwork.addTeamwork(tw_data)
        const test_id = tw_record.lastInsertRowid

        teamwork.setRequestedHelpers(test_id, ["test1", "test2"])

        const helpers = teamwork.allHelpers(test_id)
        expect(helpers.length).toEqual(2)
      })
    })

    describe("with some helpers", () => {
      it("sets requested flag on named helpers", () => {
        const tw_data = {
          command: "test",
          options: {},
          leader: "leader",
          locale: "en-US",
          channelId: "channel",
          description: "description",
        }
        const tw_record = teamwork.addTeamwork(tw_data)
        const test_id = tw_record.lastInsertRowid
        teamwork.addHelper({
          teamwork_id: test_id,
          userId: "test1",
        })

        teamwork.setRequestedHelpers(test_id, ["test1"])

        const helpers = teamwork.allHelpers(test_id)
        expect(helpers[0].requested).toEqual(true)
      })

      it("does not modify other helpers", () => {
        const tw_data = {
          command: "test",
          options: {},
          leader: "leader",
          locale: "en-US",
          channelId: "channel",
          description: "description",
        }
        const tw_record = teamwork.addTeamwork(tw_data)
        const test_id = tw_record.lastInsertRowid
        teamwork.addHelper({
          teamwork_id: test_id,
          userId: "test1",
        })

        teamwork.setRequestedHelpers(test_id, ["test2"])

        const helpers = teamwork.allHelpers(test_id)
        expect(helpers[1].requested).toEqual(false)
      })
    })

    describe("removing requested helpers", () => {
      it("removes required flag from omitted helpers", () => {
        const tw_data = {
          command: "test",
          options: {},
          leader: "leader",
          locale: "en-US",
          channelId: "channel",
          description: "description",
        }
        const tw_record = teamwork.addTeamwork(tw_data)
        const test_id = tw_record.lastInsertRowid
        teamwork.addHelper({
          teamwork_id: test_id,
          userId: "test1",
          requested: true,
        })

        teamwork.setRequestedHelpers(test_id, ["test2"])

        const helpers = teamwork.allHelpers(test_id)
        expect(helpers[1].requested).toEqual(false)
      })
    })
  })

  describe("allHelpers", () => {
    it("includes helpers with no dice", () => {
      const tw_data = {
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      }
      const tw_record = teamwork.addTeamwork(tw_data)
      const test_id = tw_record.lastInsertRowid
      teamwork.addHelper({
        teamwork_id: test_id,
        userId: "test1",
      })

      teamwork.setRequestedHelpers(test_id, ["test2"])

      const helpers = teamwork.allHelpers(test_id)
      expect(helpers.length).toEqual(2)
    })

    it("includes helpers with dice", () => {
      const tw_data = {
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      }
      const tw_record = teamwork.addTeamwork(tw_data)
      const test_id = tw_record.lastInsertRowid
      teamwork.addHelper({
        teamwork_id: test_id,
        userId: "test1",
        dice: 5,
      })

      teamwork.setRequestedHelpers(test_id, ["test2"])

      const helpers = teamwork.allHelpers(test_id)
      expect(helpers.length).toEqual(2)
    })
  })

  describe("realHelpers", () => {
    it("excludes helpers with no dice", () => {
      const tw_data = {
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      }
      const tw_record = teamwork.addTeamwork(tw_data)
      const test_id = tw_record.lastInsertRowid
      teamwork.addHelper({
        teamwork_id: test_id,
        userId: "test1",
      })

      teamwork.setRequestedHelpers(test_id, ["test2"])

      const helpers = teamwork.realHelpers(test_id)
      expect(helpers.length).toEqual(0)
    })

    it("includes helpers with no dice", () => {
      const tw_data = {
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
      }
      const tw_record = teamwork.addTeamwork(tw_data)
      const test_id = tw_record.lastInsertRowid
      teamwork.addHelper({
        teamwork_id: test_id,
        userId: "test1",
        dice: 5,
      })

      teamwork.setRequestedHelpers(test_id, ["test2"])

      const helpers = teamwork.realHelpers(test_id)
      expect(helpers.length).toEqual(1)
    })
  })
})

describe("Opposed DB", () => {
  let opposed

  beforeEach(() => {
    opposed = new Opposed(db)
  })

  describe.only("addParticipant", () => {
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
