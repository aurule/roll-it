jest.mock("../util/message-builders")

const { Teamwork } = require("../db/teamwork")
const { Interaction } = require("../../testing/interaction")
const teamwork = require("./teamwork")

describe("teamwork reply handler", () => {
  describe("canHandle", () => {
    let teamwork_db
    let interaction

    beforeEach(() => {
      interaction = new Interaction()

      teamwork_db = new Teamwork()
      const teamwork_id = teamwork_db.addTeamwork({
        command: "test",
        options: {},
        leader: "leader",
        locale: "en-US",
        channelId: "channel",
        description: "description",
        timeout: 1000,
      }).lastInsertRowid
      teamwork_db.addMessage({
        message_uid: interaction.message.id,
        teamwork_id,
      })
    })

    it("returns true when message exists", () => {
      const result = teamwork.canHandle(interaction)

      expect(result).toBe(true)
    })

    it("returns false when message does not exist", () => {
      const result = teamwork.canHandle({reference: {messageId: "nope"}})

      expect(result).toBe(false)
    })
  })

  describe("extractNumber", () => {
    it("returns a positive number", () => {
      const result = teamwork.extractNumber("I got 5 successes")

      expect(result).toEqual(5)
    })

    it("returns multi-digit numbers", () => {
      const result = teamwork.extractNumber("I got 11 successes")

      expect(result).toEqual(11)
    })

    it("returns a negative number with no spaces", () => {
      const result = teamwork.extractNumber("I got -5 successes")

      expect(result).toEqual(-5)
    })

    it("returns a negative number with spaces", () => {
      const result = teamwork.extractNumber("I got - 5 successes")

      expect(result).toEqual(-5)
    })

    it("returns undefined with no number", () => {
      const result = teamwork.extractNumber("I got zapped")

      expect(result).toBeUndefined()
    })
  })

  describe("handle", () => {
    let interaction
    let teamwork_db

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with missing test", () => {
      it("whispers with concluded message", async () => {
        await teamwork.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with expired test", () => {
      beforeEach(() => {
        teamwork_db = new Teamwork()
        const teamwork_id = teamwork_db.addTeamwork({
          command: "test",
          options: {},
          leader: "leader",
          locale: "en-US",
          channelId: "channel",
          description: "description",
          timeout: -1000,
        }).lastInsertRowid
        teamwork_db.addMessage({
          message_uid: interaction.message.id,
          teamwork_id,
        })
      })

      it("whispers with concluded message", async () => {
        await teamwork.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with no number", () => {
      beforeEach(() => {
        teamwork_db = new Teamwork()
        const teamwork_id = teamwork_db.addTeamwork({
          command: "test",
          options: {},
          leader: "leader",
          locale: "en-US",
          channelId: "channel",
          description: "description",
          timeout: 1000,
        }).lastInsertRowid
        teamwork_db.addMessage({
          message_uid: interaction.message.id,
          teamwork_id,
        })

        interaction.content = "I have no successes"
      })

      it("whispers with missing number message", async () => {
        await teamwork.handle(interaction)

        expect(interaction.replyContent).toMatch("find a number")
      })
    })

    describe("with valid data", () => {
      let teamwork_id

      beforeEach(() => {
        teamwork_db = new Teamwork()
        teamwork_id = teamwork_db.addTeamwork({
          command: "test",
          options: {},
          leader: "leader",
          locale: "en-US",
          channelId: "channel",
          description: "description",
          timeout: 1000,
        }).lastInsertRowid
        teamwork_db.addMessage({
          message_uid: interaction.message.id,
          teamwork_id,
        })

        interaction.content = "I have 3 successes"
      })

      it("saves the dice for the user", async () => {
        await teamwork.handle(interaction)

        const helper = teamwork_db.getHelperDetails(teamwork_id, interaction.user.id)
        expect(helper.dice).toEqual(3)
      })

      it("replies with the success message", async () => {
        await teamwork.handle(interaction)

        expect(interaction.replyContent).toMatch("added 3 dice")
      })
    })
  })
})
