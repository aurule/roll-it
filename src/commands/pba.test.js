vitest.mock("../util/message-builders")

import { Pba } from "./pba.js"

import { Interaction } from "../../testing/interaction.js"

describe("/pba command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("pba command", () => {
    describe("judge", () => {
      describe("with dominant outcome", () => {
        it.concurrent.each([
          [11, "pleases"],
          [9, "accepted"],
          [6, "noted"],
          [4, "inadequate"],
          [2, "angers"],
        ])("returns correct text for %i", async (die, text) => {
          const pba_command = new Pba(interaction)
          const results = [die]

          const result = pba_command.judge(results)

          expect(result).toMatch(text)
        })
      })

      describe("with no dominant outcome", () => {
        it("returns the neutral message", () => {
          const pba_command = new Pba(interaction)
          const results = [2, 7, 12]

          const result = pba_command.judge(results)

          expect(result).toMatch("noted")
        })
      })
    })

    describe("perform", () => {
      it("shows the sacrifice easter egg if triggered", () => {
        interaction.command_options = {
          description: "sacrificing",
        }
        const pba_command = new Pba(interaction)

        const result = pba_command.perform()

        expect(result).toMatch("Your sacrifice")
      })
    })
  })
})
