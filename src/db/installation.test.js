const { simpleflake } = require("simpleflakes")
const { makeDB } = require("./index")
const { Installation } = require("./installation")

describe("Installation DB", () => {
  /**
   * @type Installation
   */
  let installation
  let db

  beforeEach(() => {
    db = makeDB()
    installation = new Installation(db)
  })

  describe("addInstallation", () => {
    it("creates a record", () => {
      installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        state: "start",
        timeout: 1000,
      })

      expect(installation.installationCount()).toEqual(1)
    })
  })

  describe("installationCount", () => {
    it("counts total installation records", () => {
      installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        state: "start",
        timeout: 1000,
      })
      installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        state: "start",
        timeout: 1000,
      })

      expect(installation.installationCount()).toEqual(2)
    })
  })

  describe("destroy", () => {
    it("removes the record", () => {
      const installation_id = installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        state: "start",
        timeout: 1000,
      }).lastInsertRowid

      installation.destroy(installation_id)

      expect(installation.installationCount()).toEqual(0)
    })
  })

  describe("getInstallation", () => {
    let installation_id

    beforeEach(() => {
      installation_id = installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        state: "start",
        timeout: 1000,
      }).lastInsertRowid
    })

    it("returns undefined for bad id", () => {
      const result = installation.getInstallation(789)

      expect(result).toBeUndefined()
    })

    it("gets the record", () => {
      const result = installation.getInstallation(installation_id)

      expect(result.guild_uid).toEqual("guild")
    })

    describe("expired flag", () => {
      it("is false when expires_at is in future", () => {
        const result = installation.getInstallation(installation_id)

        expect(result.expired).toEqual(false)
      })

      it("is true when expires_at is in past", () => {
        installation_id = installation.addInstallation({
          locale: "en-US",
          guild_uid: "guild",
          user_uid: "user",
          state: "start",
          timeout: -1000,
        }).lastInsertRowid

        const result = installation.getInstallation(installation_id)

        expect(result.expired).toEqual(true)
      })
    })
  })
})
