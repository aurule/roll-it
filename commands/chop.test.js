const chop_command = require("./chop")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  describe("with one roll", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 1
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      chop_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })

    describe("secret", () => {
      it("when secret is true, reply is ephemeral", () => {
        interaction.command_options.secret = true

        chop_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeTruthy()
      })

      it("when secret is false, reply is not ephemeral", () => {
        interaction.command_options.secret = false

        chop_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeFalsy()
      })

      it("secret defaults to false", () => {
        chop_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeFalsy()
      })
    })
  })

  describe("with multiple rolls", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 2
    })

    it("displays the description if present", () => {
      const description_text = "this is a test"
      interaction.command_options.description = description_text

      chop_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })
  })
})
