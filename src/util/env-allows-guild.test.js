const { envAllowsGuild } = require("./env-allows-guild")

describe("envAllowsGuild", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  describe("in development mode", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development"
    })

    it("true for dev guilds", () => {
      process.env.DEV_GUILDS = "[12345]"
      const guildId = "12345"

      expect(envAllowsGuild(guildId)).toBeTruthy()
    })

    it("false for all other guilds", () => {
      process.env.DEV_GUILDS = "[12345]"
      const guildId = "09876"

      expect(envAllowsGuild(guildId)).toBeFalsy()
    })
  })
  describe("in non-development mode", () => {
    it("false for dev guilds", () => {
      process.env.DEV_GUILDS = "[12345]"
      const guildId = "12345"

      expect(envAllowsGuild(guildId)).toBeFalsy()
    })

    it("true for all other guilds", () => {
      process.env.DEV_GUILDS = "[12345]"
      const guildId = "09876"

      expect(envAllowsGuild(guildId)).toBeTruthy()
    })
  })
})
