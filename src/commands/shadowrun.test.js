const { Interaction } = require("../../testing/interaction")

const shadowrun_command = require("./shadowrun")

const { test_secret_option } = require("../../testing/shared/execute-secret")

describe("shadowrun command", () => {
  describe("schema", () => {
    describe("edge", () => {
      const edge_schema = shadowrun_command.schema.extract("edge")

      it("is optional", () => {
        const result = edge_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is a bool", () => {
        const result = edge_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = edge_schema.validate(true)

        expect(result.error).toBeFalsy()
      })
    })
  })

  describe("perform", () => {
    describe("with one roll", () => {
      it("displays the description if present", () => {
        const options = {
          pool: 1,
          description: "a test",
        }

        const result = shadowrun_command.perform(options)

        expect(result).toMatch("a test")
      })

      it("displays a result", () => {
        const options = {
          pool: 1,
          description: "a test",
        }

        const result = shadowrun_command.perform(options)

        expect(result).toMatch("**")
      })
    })

    describe("with multiple rolls", () => {
      it("displays the description if present", () => {
        const options = {
          pool: 1,
          rolls: 3,
          description: "a test",
        }

        const result = shadowrun_command.perform(options)

        expect(result).toMatch("a test")
      })

      it("displays a result", () => {
        const options = {
          pool: 1,
          rolls: 3,
          description: "a test",
        }

        const result = shadowrun_command.perform(options)

        expect(result).toMatch("**")
      })
    })

    describe("with until", () => {
      it("displays the description if present", () => {
        const options = {
          pool: 1,
          rolls: 3,
          until: 1,
          description: "a test",
        }

        const result = shadowrun_command.perform(options)

        expect(result).toMatch("a test")
      })

      it("displays a result", () => {
        const options = {
          pool: 1,
          rolls: 3,
          until: 1,
          description: "a test",
        }

        const result = shadowrun_command.perform(options)

        expect(result).toMatch("**")
      })
    })
  })

  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with teamwork", () => {
      it("disallows rolls option", async () => {
        interaction.command_options.pool = 3
        interaction.command_options.teamwork = true
        interaction.command_options.rolls = 4

        await shadowrun_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("disallows until option", async () => {
        interaction.command_options.pool = 3
        interaction.command_options.teamwork = true
        interaction.command_options.until = 4

        await shadowrun_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("disallows secret option", async () => {
        interaction.command_options.pool = 3
        interaction.command_options.teamwork = true
        interaction.command_options.secret = true

        await shadowrun_command.execute(interaction)

        expect(interaction.replyContent).toMatch("cannot use teamwork")
      })

      it("shows the teamwork prompt with correct options", async () => {
        interaction.command_options.teamwork = true
        interaction.command_options.pool = 5

        await shadowrun_command.execute(interaction)

        expect(interaction.replyContent).toMatch("started a teamwork")
      })
    })

    it("responds with the result", async () => {
      interaction.command_options.pool = 3

      await shadowrun_command.execute(interaction)

      expect(interaction.replyContent).toMatch("**")
    })
  })

  test_secret_option(shadowrun_command, { pool: 1 })
})
