const path = require("path")

const db = require("./index")

describe("db module", () => {
  describe("dbFileParent", () => {
    it("puts dev db in .sqlite", () => {
      const result = db.dbFileParent("development")

      expect(result).toMatch(".sqlite")
    })

    it("puts prod db outside of .sqlite", () => {
      const result = db.dbFileParent("production")

      expect(result).not.toMatch(".sqlite")
    })

    it("puts other env db outside of .sqlite", () => {
      const result = db.dbFileParent("other")

      expect(result).not.toMatch(".sqlite")
    })
  })

  describe("mainDatabaseFile", () => {
    it.concurrent.each([
      ["development", "roll-it.dev.db"],
      ["production", "roll-it.prod.db"],
      ["other", ":memory:"],
    ])("for %s env uses file %s", (env_name, file_name) => {
      const result = db.mainDatabaseFile(env_name)

      expect(result).toMatch(file_name)
    })
  })

  describe("statsDatabaseFile", () => {
    it.concurrent.each([
      ["development", "roll-it-stats.dev.db"],
      ["production", "roll-it-stats.prod.db"],
      ["other", ":memory:"],
    ])("for %s env uses file %s", (env_name, file_name) => {
      const result = db.statsDatabaseFile(env_name)

      expect(result).toMatch(file_name)
    })
  })

  describe("interactiveDatabaseFile", () => {
    it.concurrent.each([
      ["development", "roll-it-interactive.dev.db"],
      ["production", "roll-it-interactive.prod.db"],
      ["other", ":memory:"],
    ])("for %s env uses file %s", (env_name, file_name) => {
      const result = db.interactiveDatabaseFile(env_name)

      expect(result).toMatch(file_name)
    })
  })
})
