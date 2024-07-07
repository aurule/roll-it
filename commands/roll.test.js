const roll_command = require("./roll")

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
      interaction.command_options.sides = 2
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })

    it("displays the result", () => {
      roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch(/\*\*\d\*\*/)
    })

    it("displays the modifier", () => {
      interaction.command_options.modifier = 8

      roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("8")
    })
  })

  describe("with multiple rolls", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
      interaction.command_options.pool = 1
      interaction.command_options.sides = 2
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })

    it("displays the result", () => {
      roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch(/\*\*\d\*\*/)
    })

    it("displays the modifier", () => {
      interaction.command_options.modifier = 8

      roll_command.execute(interaction)

      expect(interaction.replyContent).toMatch("8")
    })
  })

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", () => {
      interaction.command_options.secret = true

      roll_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", () => {
      interaction.command_options.secret = false

      roll_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })

    it("secret defaults to false", () => {
      roll_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })
  })
})
