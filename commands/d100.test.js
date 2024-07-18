const d100_command = require("./d100")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("perform", () => {
  it("displays the description if present", () => {
    const options = {
      description: "this is a test"
    }

    const result = d100_command.perform(options)

    expect(result).toMatch("this is a test")
  })
})

describe("execute", () => {
  describe("with one roll", () => {
    beforeEach(() => {
      interaction.command_options.rolls = 1
    })

    describe("secret", () => {
      it("when secret is true, reply is ephemeral", () => {
        interaction.command_options.secret = true

        d100_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeTruthy()
      })

      it("when secret is false, reply is not ephemeral", () => {
        interaction.command_options.secret = false

        d100_command.execute(interaction)

        expect(interaction.replies[0].ephemeral).toBeFalsy()
      })

      it("secret defaults to false", () => {
        d100_command.execute(interaction)

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

      d100_command.execute(interaction)

      expect(interaction.replyContent).toMatch(description_text)
    })
  })
})
