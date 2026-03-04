import { Interaction } from "../../testing/interaction.js"

import { Fate } from "./fate.js"

describe("/fate command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("judge", () => {
    describe("with dominant outcome", () => {
      it.concurrent.each([
        [4, "pleases"],
        [2, "accepted"],
        [0, "noted"],
        [-2, "inadequate"],
        [-4, "angers"],
      ])("returns correct text for %i", async (die, text) => {
        const fate_command = new Fate(interaction)
        const results = [die]

        const result = fate_command.judge(results)

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const fate_command = new Fate(interaction)
        const results = [-4, 0, 4]

        const result = fate_command.judge(results)

        expect(result).toMatch("noted")
      })
    })
  })

  describe("perform", () => {
    it("displays the sacrifice easter egg if present", () => {
      const description_text = "sacrificing a goat"
      interaction.command_options = {
        description: description_text,
      }
      const cmd = new Fate(interaction)

      const result = cmd.perform()

      expect(result).toMatch("Your sacrifice")
    })
  })
})
