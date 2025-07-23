jest.mock("../../util/message-builders")

const feedback_help_command = require("./feedback")

const { Interaction } = require("../../../testing/interaction")
const { User } = require("../../../testing/user")
const { Feedback } = require("../../db/feedback")
const { UserBans } = require("../../db/bans")

describe("execute", () => {
  let interaction

  describe("with a banned user", () => {
    let banned_user

    beforeEach(() => {
      banned_user = new User()
      const bans = new UserBans(banned_user.id)
      bans.create("testing")
      interaction = new Interaction(null, banned_user.id)
    })

    it("does not add feedback", () => {
      feedback_help_command.execute(interaction)

      const feedbacks = new Feedback()
      expect(feedbacks.count()).toEqual(0)
    })

    it("says the user is banned", () => {
      feedback_help_command.execute(interaction)

      expect(interaction.replyContent).toMatch("not allowed")
    })
  })

  describe("with a valid user", () => {
    beforeEach(() => {
      interaction = new Interaction()
    })

    it("says feedback was recorded", () => {
      interaction.command_options.message = "test message"

      feedback_help_command.execute(interaction)

      expect(interaction.replyContent).toMatch("has been recorded")
    })

    it("saves message", () => {
      interaction.command_options.message = "test message"

      feedback_help_command.execute(interaction)

      const feedbacks = new Feedback()
      const messages = feedbacks.all().map((f) => f.content)
      expect(messages).toContain("test message")
    })

    it("saves command name", () => {
      interaction.command_options.message = "test message"
      interaction.command_options.command = "d20"

      feedback_help_command.execute(interaction)

      const feedbacks = new Feedback()
      const commands = feedbacks.all().map((f) => f.commandName)
      expect(commands).toContain("d20")
    })

    it("saves consent", () => {
      interaction.command_options.message = "test message"
      interaction.command_options.consent = "yes"

      feedback_help_command.execute(interaction)

      const feedbacks = new Feedback()
      const consents = feedbacks.all().map((f) => f.canReply)
      expect(consents).toContain(true)
    })
  })
})
