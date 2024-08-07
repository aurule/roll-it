const wod_command = require("./wod20")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  describe("with one roll", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 1
      interaction.command_options.pool = 1
    })

    it("displays the description if present", async () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      await wod_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })

    it("displays the result", async () => {
      await wod_command.execute(interaction)

      expect(interaction.replyContent).toMatch(/\*\*(botch|\d)\*\*/)
    })
  })

  describe("with multiple rolls", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
      interaction.command_options.pool = 1
    })

    it("displays the description if present", async () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      await wod_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })

    it("displays the result", async () => {
      await wod_command.execute(interaction)

      expect(interaction.replyContent).toMatch(/\*\*(botch|\d)\*\*/)
    })
  })

  describe("with until", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
      interaction.command_options.pool = 1
      interaction.command_options.until = 1
    })

    it("displays the description if present", async () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      await wod_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })

    it("displays the result", async () => {
      await wod_command.execute(interaction)

      expect(interaction.replyContent).toMatch(/\*\*(botch|\d)\*\*/)
    })
  })

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      await wod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      await wod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })

    it("secret defaults to false", async () => {
      await wod_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })
  })
})
