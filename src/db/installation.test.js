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
        old_deets: {
          commands: [],
          systems: [],
          features: [],
        },
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

    it("extracts the old details", () => {
      const result = installation.getInstallation(installation_id)

      expect(result.old_deets.commands).toEqual([])
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

  describe("message methods", () => {
    let installation_id

    beforeEach(() => {
      installation_id = installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        state: "start",
        old_deets: {
          commands: [],
          systems: [],
          features: [],
        },
        timeout: 1000,
      }).lastInsertRowid
    })

    describe("addMessage", () => {
      it("creates a new message record", () => {
        installation.addMessage({
          message_uid: "test message",
          installation_id,
        })

        expect(installation.hasMessage("test message")).toBe(true)
      })

      it("links to the install", () => {
        const message_id = installation.addMessage({
          message_uid: "test message",
          installation_id,
        }).lastInsertRowid

        const record = installation.getMessage(message_id)

        expect(record.installation_id).toEqual(installation_id)
      })
    })

    describe("getMessage", () => {
      let message_id

      beforeEach(() => {
        message_id = installation.addMessage({
          message_uid: "test message",
          installation_id,
        }).lastInsertRowid
      })

      it("gets the message for the id", () => {
        const result = installation.getMessage(message_id)

        expect(result.message_uid).toEqual("test message")
      })

      it("returns undefined for unknown ID", () => {
        const result = installation.getMessage(55)

        expect(result).toBeUndefined()
      })
    })

    describe("hasMessage", () => {
      beforeEach(() => {
        installation.addMessage({
          message_uid: "test message",
          installation_id,
        })
      })

      it("returns true if the uid exists", () => {
        const result = installation.hasMessage("test message")

        expect(result).toBe(true)
      })

      it("returns false if the uid does not exist", () => {
        const result = installation.hasMessage("nope")

        expect(result).toBe(false)
      })
    })
  })
})
