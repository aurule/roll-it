vitest.mock("../util/message-builders")

import { Swn } from "./swn.js"

import { Interaction } from "../../testing/interaction.js"

describe("/swn command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("schema", () => {
    describe("pool", () => {
      const pool_schema = Swn.schema.extract("pool")

      it("has a min of 2", () => {
        const result = pool_schema.validate(1)

        expect(result.error).toBeTruthy()
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
        [11, "pleases"],
        [9, "accepted"],
        [6, "noted"],
        [4, "inadequate"],
        [2, "angers"],
      ])("returns correct text for %i", async (die, text) => {
        const swn_command = new Swn(interaction)
        const results = [die]

        const result = swn_command.judge(results)

        expect(result).toMatch(text)
      })
    })

    describe("with no dominant outcome", () => {
      it("returns the neutral message", () => {
        const swn_command = new Swn(interaction)
        const results = [2, 7, 12]

        const result = swn_command.judge(results)

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
        description: "sacrificing",
        rolls: 1,
      }
      const swn_command = new Swn(interaction)

      const result = swn_command.perform()

      expect(result).toMatch("Your sacrifice")
    })
  })
})
