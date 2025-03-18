const ffrpg_command = require("./ffrpg")

const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")
const { FfrpgPresenter } = require("../presenters/results/ffrpg-results-presenter")
const { CommandInteraction } = require("../../testing/command-interaction")

describe("ffrpg command", () => {
  describe("schema", () => {
    describe("base", () => {
      const base_schema = ffrpg_command.schema.extract("base")

      it("is an integer", () => {
        const result = base_schema.validate(22.5)

        expect(result.error).toBeTruthy()
      })

      it("is required", () => {
        const result = base_schema.validate()

        expect(result.error).toBeTruthy()
      })
    })

    describe("intrinsic", () => {
      const intrinsic_schema = ffrpg_command.schema.extract("intrinsic")

      it("is an integer", () => {
        const result = intrinsic_schema.validate(22.5)

        expect(result.error).toBeTruthy()
      })

      it("is required", () => {
        const result = intrinsic_schema.validate()

        expect(result.error).toBeFalsy()
      })
    })

    describe("conditional", () => {
      const conditional_schema = ffrpg_command.schema.extract("conditional")

      it("is an integer", () => {
        const result = conditional_schema.validate(22.5)

        expect(result.error).toBeTruthy()
      })

      it("is required", () => {
        const result = conditional_schema.validate()

        expect(result.error).toBeFalsy()
      })
    })

    describe("avoid", () => {
      const avoid_schema = ffrpg_command.schema.extract("avoid")

      it("is an integer", () => {
        const result = avoid_schema.validate(22.5)

        expect(result.error).toBeTruthy()
      })

      it("is required", () => {
        const result = avoid_schema.validate()

        expect(result.error).toBeFalsy()
      })
    })

    describe("crit", () => {
      const crit_schema = ffrpg_command.schema.extract("crit")

      it("is an integer", () => {
        const result = crit_schema.validate(22.5)

        expect(result.error).toBeTruthy()
      })

      it("is required", () => {
        const result = crit_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("has a min of 0", () => {
        const result = crit_schema.validate(-1)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 100", () => {
        const result = crit_schema.validate(101)

        expect(result.error).toBeTruthy()
      })
    })

    describe("botch", () => {
      const botch_schema = ffrpg_command.schema.extract("botch")

      it("is an integer", () => {
        const result = botch_schema.validate(22.5)

        expect(result.error).toBeTruthy()
      })

      it("is required", () => {
        const result = botch_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("has a min of 0", () => {
        const result = botch_schema.validate(-1)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 100", () => {
        const result = botch_schema.validate(101)

        expect(result.error).toBeTruthy()
      })
    })
  })

  describe("judge", () => {
    describe("with dominant outcome", () => {
      it("returns the correct message", () => {
        const presenter = new FfrpgPresenter({
          raw: [[23], [31]],
          base: 40,
        })

        const result = ffrpg_command.judge(presenter, "en-US")

        expect(result).toMatch("accepted")
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const presenter = new FfrpgPresenter({
          raw: [[23], [51], [98]],
          base: 40,
        })

        const result = ffrpg_command.judge(presenter, "en-US")

        expect(result).toMatch("noted")
      })
    })
  })

  describe("perform", () => {
    it("displays the description if present", () => {
      const description_text = "this is a test"
      const options = {
        description: description_text,
        base: 50,
      }

      const result = ffrpg_command.perform(options)

      expect(result).toMatch(description_text)
    })

    it("displays the modifiers", () => {
      const options = {
        base: 50,
        intrinsic: -10,
      }

      const result = ffrpg_command.perform(options)

      expect(result).toMatch("- 10")
    })

    it("includes the sacrifice message", () => {
      const options = {
        base: 50,
        intrinsic: -10,
        description: "sacrifice"
      }

      const result = ffrpg_command.perform(options)

      expect(result).toMatch("Your sacrifice")
    })
  })

  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new CommandInteraction("ffrpg")
    })

    it("shows error message for modifiers with flat", async () => {
      interaction.setOptions({
        flat: true,
        conditional: 10,
      })

      await ffrpg_command.execute(interaction)

      expect(interaction.message.content).toMatch("do not allow")
    })

    it("shows error message for crit over botch", async () => {
      interaction.setOptions({
        crit: 80,
        botch: 50,
      })

      await ffrpg_command.execute(interaction)

      expect(interaction.message.content).toMatch("must be lower")
    })

    it("shows results", async () => {
      interaction.setOptions({
        base: 60,
      })

      await ffrpg_command.execute(interaction)

      expect(interaction.message.content).toMatch("rolled a")
    })
  })

  test_secret_option(ffrpg_command)
})
