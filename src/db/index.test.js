import { dbFileParent, mainDatabaseFile, interactiveDatabaseFile } from "./index"

describe("db module", () => {
  describe("dbFileParent", () => {
    it("puts dev db in .sqlite", () => {
      const result = dbFileParent("development")

      expect(result).toMatch(".sqlite")
    })

    it("puts prod db outside of .sqlite", () => {
      const result = dbFileParent("production")

      expect(result).not.toMatch(".sqlite")
    })

    it("puts other env db outside of .sqlite", () => {
      const result = dbFileParent("other")

      expect(result).not.toMatch(".sqlite")
    })
  })

  describe("mainDatabaseFile", () => {
    it.concurrent.each([
      ["development", "roll-it.dev.db"],
      ["production", "roll-it.prod.db"],
      ["other", ":memory:"],
    ])("for %s env uses file %s", (env_name, file_name) => {
      const result = mainDatabaseFile(env_name)

      expect(result).toMatch(file_name)
    })
  })

  describe("interactiveDatabaseFile", () => {
    it.concurrent.each([
      ["development", "roll-it-interactive.dev.db"],
      ["production", "roll-it-interactive.prod.db"],
      ["other", ":memory:"],
    ])("for %s env uses file %s", (env_name, file_name) => {
      const result = interactiveDatabaseFile(env_name)

      expect(result).toMatch(file_name)
    })
  })
})
