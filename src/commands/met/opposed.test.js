vitest.mock("../../util/message-builders")

import { Interaction } from "../../../testing/interaction.js"

import { Opposed } from "./opposed.js"

describe("/met opposed", () => {
  describe("validate", () => {
    it("errors when challenging yourself", () => {
      const interaction = new Interaction()
      interaction.command_options = {
        opponent: interaction.user
      }
      const cmd = new Opposed(interaction)

      const result = cmd.validate()

      expect(result).toMatch("cannot challenge yourself")
    })
  })
})
