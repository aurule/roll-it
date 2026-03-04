vitest.mock("../util/message-builders")

import { FfrpgPresenter } from "../presenters/results/ffrpg-results-presenter.js"

import { Ffrpg } from "./ffrpg.js"
import { Interaction } from "../../testing/interaction.js"

describe("/ffrpg command", () => {
  describe("schema", () => {
    describe("base", () => {
      const base_schema = Ffrpg.schema.extract("base")

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
      const intrinsic_schema = Ffrpg.schema.extract("intrinsic")

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
      const conditional_schema = Ffrpg.schema.extract("conditional")

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
      const avoid_schema = Ffrpg.schema.extract("avoid")

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
      const crit_schema = Ffrpg.schema.extract("crit")

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
      const botch_schema = Ffrpg.schema.extract("botch")

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
      it.concurrent.each([
        [1, 40, "pleases"],
        [9, 5, "pleases"], // rule of 10
        [30, 40, "accepted"],
        [50, 40, "noted"],
        [99, 40, "inadequate"],
      ])("returns correct text for %i", async (die, base, text) => {
        const interaction = new Interaction()
        const cmd = new Ffrpg(interaction)
        const presenter = new FfrpgPresenter({
          raw: [[die]],
          base,
        })

        const result = cmd.judge(presenter, "en-US")

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const interaction = new Interaction()
        const cmd = new Ffrpg(interaction)
        const presenter = new FfrpgPresenter({
          raw: [[23], [51], [98]],
          base: 40,
        })

        const result = cmd.judge(presenter, "en-US")

        expect(result).toMatch("noted")
      })
    })
  })

  describe("perform", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("includes the sacrifice message", () => {
      interaction.command_options = {
        base: 50,
        intrinsic: -10,
        description: "sacrifice",
      }
      const cmd = new Ffrpg(interaction)

      const result = cmd.perform()

      expect(result).toMatch("Your sacrifice")
    })
  })

  describe("validate", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with a flat roll", () => {
      beforeEach(() => {
        interaction.command_options = {
          flat: true,
        }
      })

      it("disallows intrinsic", () => {
        interaction.command_options.intrinsic = 40
        const cmd = new Ffrpg(interaction)

        const result = cmd.validate()

        expect(result).toMatch("do not allow")
      })

      it("disallows conditional", () => {
        interaction.command_options.conditional = 40
        const cmd = new Ffrpg(interaction)

        const result = cmd.validate()

        expect(result).toMatch("do not allow")
      })

      it("disallows avoid", () => {
        interaction.command_options.avoid = 40
        const cmd = new Ffrpg(interaction)

        const result = cmd.validate()

        expect(result).toMatch("do not allow")
      })
    })

    it("disallows crit higher than botch", () => {
      interaction.command_options = {
        crit: 50,
        botch: 40,
      }
      const cmd = new Ffrpg(interaction)

      const result = cmd.validate()

      expect(result).toMatch("must be lower")
    })
  })
})
