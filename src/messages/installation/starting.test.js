vitest.mock("../../util/message-builders")

import { Installation } from "../../db/installation.js"
import { messageData } from "./starting.js"

describe("install starting message", () => {
  describe("messageData", () => {
    let install_id
    let install_db

    beforeEach(() => {
      install_db = new Installation()
      install_id = install_db.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        old_deets: {
          systems: ["shadowrun", "nwod"],
          features: ["tables"],
          commands: ["shadowrun", "formula", "d6", "nwod", "d10", "table"],
        },
        timeout: 1000,
      }).lastInsertRowid
    })

    it("shows the installed systems", () => {
      const result = messageData(install_id)

      expect(result.content).toMatch("Shadowrun")
    })

    it("shows the installed features", () => {
      const result = messageData(install_id)

      expect(result.content).toMatch("Tables")
    })

    it("shows the installed commands", () => {
      const result = messageData(install_id)

      expect(result.content).toMatch("`/nwod`")
    })

    it("shows the global commands", () => {
      const result = messageData(install_id)

      expect(result.content).toMatch("`/saved`")
    })

    it("shows change button", () => {
      const result = messageData(install_id)

      expect(result).toHaveComponent("install_change")
    })

    it("shows cancel button", () => {
      const result = messageData(install_id)

      expect(result).toHaveComponent("install_cancel")
    })
  })
})
