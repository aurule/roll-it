jest.mock("../../util/message-builders")

const { Installation } = require("../../db/installation")
const starting = require("./starting")

describe("install starting message", () => {
  describe("data", () => {
    let install_id
    let install_db

    beforeEach(() => {
      install_db = new Installation()
      install_id = install_db.addInstallation({
        locale: "en-US",
        guild_uid: "guild",
        user_uid: "user",
        state: "start",
        old_deets: {
          systems: ["shadowrun", "nwod"],
          features: ["tables"],
          commands: ["shadowrun", "formula", "d6", "nwod", "d10", "table"],
        },
        timeout: 1000,
      }).lastInsertRowid
    })

    it("shows the installed systems", () => {
      const result = starting.data(install_id)

      expect(result.content).toMatch("Shadowrun")
    })

    it("shows the installed features", () => {
      const result = starting.data(install_id)

      expect(result.content).toMatch("Tables")
    })

    it("shows the installed commands", () => {
      const result = starting.data(install_id)

      expect(result.content).toMatch("`/nwod`")
    })

    it("shows the global commands", () => {
      const result = starting.data(install_id)

      expect(result.content).toMatch("`/saved`")
    })

    it("shows change button", () => {
      const result = starting.data(install_id)

      expect(result).toHaveComponent("install_change")
    })

    it("shows cancel button", () => {
      const result = starting.data(install_id)

      expect(result).toHaveComponent("install_cancel")
    })
  })
})
