import { simpleflake } from "simpleflakes"
import { makeDB } from "./index.js"
import { Installation } from "./installation.js"

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
        timeout: 1000,
      })
      installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
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
          timeout: -1000,
        }).lastInsertRowid

        const result = installation.getInstallation(installation_id)

        expect(result.expired).toEqual(true)
      })
    })

    describe("finished flag", () => {
      it("is false when finished_at is null", () => {
        const result = installation.getInstallation(installation_id)

        expect(result.finished).toEqual(false)
      })

      it("is true when finished_at is set", () => {
        installation.finishInstallation(installation_id)

        const result = installation.getInstallation(installation_id)

        expect(result.finished).toEqual(true)
      })
    })
  })

  describe("finishInstallation", () => {
    it("sets the finished_at value", () => {
      const installation_id = installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        old_deets: {
          commands: [],
          systems: [],
          features: [],
        },
        timeout: 1000,
      }).lastInsertRowid

      installation.finishInstallation(installation_id)

      const record = installation.getInstallation(installation_id)
      expect(record.finished_at).toBeTruthy()
    })
  })

  describe("setNewDeets", () => {
    let installation_id

    beforeEach(() => {
      installation_id = installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        old_deets: {
          commands: [],
          systems: [],
          features: [],
        },
        timeout: 1000,
      }).lastInsertRowid
    })

    it("sets the new_deets property", () => {
      const data = {
        commands: ["nwod"],
        systems: ["nwod"],
        features: ["tables"],
      }

      installation.setNewDeets(installation_id, data)

      const record = installation.getInstallation(installation_id)
      expect(record.new_deets).toMatchObject(data)
    })
  })

  describe("message methods", () => {
    let installation_id

    beforeEach(() => {
      installation_id = installation.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
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

    describe("findInstallationByMessage", () => {
      const message_uid = "yeehaw"

      beforeEach(() => {
        installation.addMessage({
          message_uid,
          installation_id,
        })
      })

      it("returns undefined for bad message_uid", () => {
        const result = installation.findInstallationByMessage("asdf")

        expect(result).toBeUndefined()
      })

      it("gets the associated challenge record", () => {
        const result = installation.findInstallationByMessage(message_uid)

        expect(result.id).toEqual(installation_id)
      })
    })
  })
})
