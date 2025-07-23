jest.mock("../util/message-builders")

const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")
const { ShadowrunPresenter } = require("../presenters/results/shadowrun-results-presenter")

const shadowrun_command = require("./shadowrun")

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

  describe("judge", () => {
    describe("with dominant outcome", () => {
      it.concurrent.each([
        ["high success", 4, [2, 6, 4, 5, 6, 5], "pleases"],
        ["success", 3, [1, 3, 4, 5, 6, 5], "accepted"],
        ["low success", 2, [1, 2, 1, 4, 6, 5], "noted"],
        ["glitch", 2, [1, 1, 1, 1, 6, 5], "inadequate"],
        ["critical glitch", 0, [1, 1, 1, 1, 3, 4], "angers"],
      ])("returns correct text for %s", async (label, successes, dice, text) => {
        const presenter = new ShadowrunPresenter({
          pool: 6,
          summed: [successes],
          raw: [dice],
          rolls: 1,
          locale: "en-US",
        })

        const result = shadowrun_command.judge(presenter)

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const presenter = new ShadowrunPresenter({
          pool: 6,
          summed: [0, 2, 4],
          raw: [
            [1, 3, 1, 5, 4, 5],
            [1, 3, 2, 5, 6, 5],
            [2, 6, 4, 5, 6, 5],
          ],
          rolls: 3,
          locale: "en-US",
        })

        const result = shadowrun_command.judge(presenter)

        expect(result).toMatch("noted")
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

      it("displays the sacrifice easter egg if present", () => {
        const options = {
          pool: 1,
          description: "sacrifice",
        }

        const result = shadowrun_command.perform(options)

        expect(result).toMatch("Your sacrifice")
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
