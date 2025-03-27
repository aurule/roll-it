const roll_cache = require("./roll-cache")

describe("roll cache", () => {
  describe("set", () => {
    it("saves data by guild and user", async () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }

      await roll_cache.set(interaction, "test")

      const stored = await roll_cache.get(interaction)
      expect(stored).toEqual("test")
    })
  })

  describe("get", () => {
    it("gets the data for the interaction guild and user", async () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }
      await roll_cache.set(interaction, "test")

      const found = await roll_cache.get(interaction)

      expect(found).toEqual("test")
    })
  })

  describe("remove", () => {
    it("removes the data for interaction guild and user", async () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }
      await roll_cache.set(interaction, "test")

      await roll_cache.delete(interaction)

      const stored = await roll_cache.get(interaction)
      expect(stored).toBeUndefined()
    })
  })
})
