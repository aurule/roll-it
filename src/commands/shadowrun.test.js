vitest.mock("../util/message-builders")

import { Interaction } from "../../testing/interaction.js"
import { ShadowrunPresenter } from "../presenters/results/shadowrun-results-presenter.js"

import { Shadowrun } from "./shadowrun.js"

describe("/shadowrun command", () => {
  describe("schema", () => {
    describe("edge", () => {
      const edge_schema = Shadowrun.schema.extract("edge")

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
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with dominant outcome", () => {
      it.concurrent.each([
        ["high success", 4, [2, 6, 4, 5, 6, 5], "pleases"],
        ["success", 3, [1, 3, 4, 5, 6, 5], "accepted"],
        ["low success", 2, [1, 2, 1, 4, 6, 5], "noted"],
        ["glitch", 2, [1, 1, 1, 1, 6, 5], "inadequate"],
        ["critical glitch", 0, [1, 1, 1, 1, 3, 4], "angers"],
      ])("returns correct text for %s", async (_label, successes, dice, text) => {
        const shadowrun_command = new Shadowrun(interaction)
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
        const shadowrun_command = new Shadowrun(interaction)
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
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("displays the sacrifice easter egg if present", () => {
      interaction.command_options = {
        pool: 1,
        description: "sacrifice",
      }
      const shadowrun_command = new Shadowrun(interaction)

      const result = shadowrun_command.perform()

      expect(result).toMatch("Your sacrifice")
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
        const cmd = new Shadowrun(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })

      it("disallows until", () => {
        interaction.command_options.until = 5
        const cmd = new Shadowrun(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })

      it("disallows secret", () => {
        interaction.command_options.secret = true
        const cmd = new Shadowrun(interaction)

        const result = cmd.validate()

        expect(result).toMatch("cannot use teamwork")
      })
    })
  })
})
