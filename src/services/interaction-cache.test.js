import { Interaction } from "../../testing/interaction.js"

import interactionCache from "./interaction-cache.js"

describe("interaction cache", () => {
  describe("set", () => {
    it("stores the command name", async () => {
      const interaction = new Interaction()
      interaction.commandName = "d10"

      await interactionCache.set(interaction)

      const cached = await interactionCache.getInteraction(interaction)
      expect(cached.commandName).toEqual("d10")
    })

    it("stores the command options", async () => {
      const interaction = new Interaction()
      interaction.commandName = "d10"
      interaction.command_options = {
        modifier: 3
      }

      await interactionCache.set(interaction)

      const cached = await interactionCache.getInteraction(interaction)
      expect(cached.options.modifier).toEqual(3)
    })
  })
})
