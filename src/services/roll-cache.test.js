const roll_cache = require("./roll-cache")

describe("roll cache", () => {
  describe("store", () => {
    it("saves data by guild and user", () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }

      roll_cache.store(interaction, "test")

      expect(roll_cache.findByIds("guild", "user")).toEqual("test")
    })
  })

  describe("find", () => {
    it("gets the data for the interaction guild and user", () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }
      roll_cache.store(interaction, "test")

      const found = roll_cache.find(interaction)

      expect(found).toEqual("test")
    })
  })

  describe("findByIds", () => {
    it("gets the data by guild and user", () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }
      roll_cache.store(interaction, "test")

      const found = roll_cache.findByIds("guild", "user")

      expect(found).toEqual("test")
    })

    it("returns undefined for unknown guild", () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }
      roll_cache.store(interaction, "test")

      const found = roll_cache.findByIds("asdf", "user")

      expect(found).toBeUndefined()
    })
  })

  describe("remove", () => {
    it("removes the data for interaction guild and user", () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }
      roll_cache.store(interaction, "test")

      roll_cache.remove(interaction)

      expect(roll_cache.findByIds("asdf", "user")).toBeUndefined()
    })
  })

  describe("deleteByIds", () => {
    it("removes the data for the guild and user", () => {
      const interaction = {
        guildId: "guild",
        user: {
          id: "user"
        }
      }
      roll_cache.store(interaction, "test")

      roll_cache.deleteByIds("guild", "user")

      expect(roll_cache.findByIds("asdf", "user")).toBeUndefined()
    })
  })
})
