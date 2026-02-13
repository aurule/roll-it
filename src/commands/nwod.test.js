vitest.mock("../util/message-builders")

import { Nwod } from "./nwod.js"

import { Interaction } from "../../testing/interaction.js"
import { NwodPresenter } from "../presenters/results/nwod-results-presenter.js"

describe("/nwod command", () => {
  describe("schema", () => {
    describe("explode", () => {
      const explode_schema = Nwod.schema.extract("explode")

      it("is optional", () => {
        const result = explode_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const result = explode_schema.validate(8.4)

        expect(result.error).toBeTruthy()
      })

      it("min of 2", () => {
        const result = explode_schema.validate(1)

        expect(result.error).toBeTruthy()
      })

      it("max of 11", () => {
        const result = explode_schema.validate(12)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = explode_schema.validate(7)

        expect(result.error).toBeFalsy()
      })
    })

    describe("threshold", () => {
      const threshold_schema = Nwod.schema.extract("threshold")

      it("is optional", () => {
        const result = threshold_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is an int", () => {
        const result = threshold_schema.validate(5.5)

        expect(result.error).toBeTruthy()
      })

      it("min of 2", () => {
        const result = threshold_schema.validate(1)

        expect(result.error).toBeTruthy()
      })

      it("max of 10", () => {
        const result = threshold_schema.validate(11)

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = threshold_schema.validate(9)

        expect(result.error).toBeFalsy()
      })
    })

    describe("rote", () => {
      const rote_schema = Nwod.schema.extract("rote")

      it("is optional", () => {
        const result = rote_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is a bool", () => {
        const result = rote_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = rote_schema.validate(true)

        expect(result.error).toBeFalsy()
      })
    })

    describe("decreasing", () => {
      const decreasing_schema = Nwod.schema.extract("decreasing")

      it("is optional", () => {
        const result = decreasing_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is a bool", () => {
        const result = decreasing_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = decreasing_schema.validate(true)

        expect(result.error).toBeFalsy()
      })
    })
  })

  describe("judge", () => {
    let interaction
    let nwod_command

    beforeEach(() => {
      interaction = new Interaction()
      nwod_command = new Nwod(interaction)
    })

    describe("with dominant outcome", () => {
      it.concurrent.each([
        [4, "pleases"],
        [3, "accepted"],
        [2, "noted"],
        [1, "inadequate"],
        [0, "angers"],
      ])("returns correct text for %i", async (successes, text) => {
        const presenter = new NwodPresenter({
          pool: 6,
          summed: [successes],
          rolls: 1,
          locale: "en-US",
        })

        const result = nwod_command.judge(presenter)

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          summed: [0, 2, 4],
          rolls: 3,
          locale: "en-US",
        })

        const result = nwod_command.judge(presenter)

        expect(result).toMatch("noted")
      })
    })

    describe("with a chance roll", () => {
      it.concurrent.each([
        [10, 1, "pleases"],
        [5, 0, "inadequate"],
        [1, 0, "angers"],
      ])("returns correct text for %i", async (die, successes, text) => {
        const presenter = new NwodPresenter({
          pool: 1,
          summed: [successes],
          raw: [[die]],
          chance: true,
          rolls: 1,
          locale: "en-US",
        })

        const result = nwod_command.judge(presenter)

        expect(result).toMatch(text)
      })
    })
  })

  describe("validate", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with teamwork", () => {
      beforeEach(() => {
        interaction.command_options = {
          teamwork: true,
        }
      })

      it("requires one roll", () => {
        interaction.command_options.rolls = 5
        const cmd = new Nwod(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })

      it("disallows until", () => {
        interaction.command_options.until = 5
        const cmd = new Nwod(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })

      it("disallows secret", () => {
        interaction.command_options.secret = true
        const cmd = new Nwod(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })

      it("requiers a pool >= 1", () => {
        interaction.command_options.pool = 0
        const cmd = new Nwod(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })
    })
  })

  describe("perform", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with chance pool", () => {
      beforeEach(() => {
        interaction.command_options.pool = 0
      })

      it("forces pool to 1", () => {
        const cmd = new Nwod(interaction)

        cmd.perform()

        expect(cmd.pool).toBe(1)
      })

      it("forces explode to 10", () => {
        interaction.command_options.explode = 9
        const cmd = new Nwod(interaction)

        cmd.perform()

        expect(cmd.explode).toBe(10)
      })

      it("forces threshold to 10", () => {
        const cmd = new Nwod(interaction)

        cmd.perform()

        expect(cmd.threshold).toBe(10)
      })

      it("forces decreasing false", () => {
        interaction.command_options.decreasing = true
        const cmd = new Nwod(interaction)

        cmd.perform()

        expect(cmd.decreasing).toBe(false)
      })
    })

    describe("with until true", () => {
      beforeEach(() => {
        interaction.command_options.until = 5
      })

      it("shows the sacrifice easter egg", () => {
        interaction.command_options.description = "sacrificing"
        const cmd = new Nwod(interaction)

        const result = cmd.perform()

        expect(result).toMatch("Your sacrifice")
      })
    })

    describe("in normal mode", () => {
      it("shows the sacrifice easter egg", () => {
        interaction.command_options.description = "sacrificing"
        const cmd = new Nwod(interaction)

        const result = cmd.perform()

        expect(result).toMatch("Your sacrifice")
      })
    })
  })
})
