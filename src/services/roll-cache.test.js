const roll_cache = require("./roll-cache")

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

describe("findByIds", () => {
  it("gets the data by guild and user", () => {
    const interaction = {
      guildId: "guild",
      user: {
        id: "user"
      }
    }

    roll_cache.store(interaction, "test")

    expect(roll_cache.findByIds("guild", "user")).toEqual("test")
  })

  it("returns undefined for unknown guild", () => {
    const interaction = {
      guildId: "guild",
      user: {
        id: "user"
      }
    }

    roll_cache.store(interaction, "test")

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
