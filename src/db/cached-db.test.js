const { CachedDb } = require("./cached-db")

describe("CachedDb", () => {
  describe("prepared", () => {
    it("returns a brand new query", () => {
      const db = new CachedDb()

      const stmt = db.prepared("hello", "SELECT 'hello'")

      expect(stmt.source).toMatch("SELECT")
    })

    it("returns a saved new query", () => {
      const db = new CachedDb()
      db.prepared("hello", "SELECT 'hello'")

      const stmt = db.prepared("hello", "")

      expect(stmt.source).toMatch("SELECT")
    })
  })
})
