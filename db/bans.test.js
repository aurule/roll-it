const { makeDB } = require("./index")

const { UserBans } = require("./bans")

let db

beforeEach(() => {
  db = makeDB()
})

describe("UserBans", () => {
  describe("create", () => {
    it("creates a record", () => {
      const bans = new UserBans("testuser", db)

      bans.create("test ban")

      expect(bans.count()).toEqual(1)
    })

    it("saves the user ID", () => {
      const bans = new UserBans("testuser", db)

      const result = bans.create("test ban")

      const record = bans.detail(result.lastInsertRowid)
      expect(record.userFlake).toEqual("testuser")
    })

    it("saves the ban reason", () => {
      const bans = new UserBans("testuser", db)

      const result = bans.create("test ban")

      const record = bans.detail(result.lastInsertRowid)
      expect(record.reason).toEqual("test ban")
    })
  })

  describe("lift", () => {
    it("saves lifted reason", () => {
      const bans = new UserBans("testuser", db)
      const created = bans.create("test ban")
      const record_id = created.lastInsertRowid

      bans.lift(record_id, "all done")

      const record = bans.detail(record_id)
      expect(record.lifted_reason).toEqual("all done")
    })

    it("saves lifted timestamp", () => {
      const bans = new UserBans("testuser", db)
      const created = bans.create("test ban")
      const record_id = created.lastInsertRowid

      bans.lift(record_id, "all done")

      const record = bans.detail(record_id)
      expect(record.lifted_at).toBeTruthy()
    })
  })

  describe("is_banned", () => {
    it("returns false with no bans", () => {
      const bans = new UserBans("testuser", db)

      const result = bans.is_banned()

      expect(result).toBeFalsy()
    })

    it("returns true with an active ban", () => {
      const bans = new UserBans("testuser", db)
      bans.create("test ban")

      const result = bans.is_banned()

      expect(result).toBeTruthy()
    })

    it("returns false with just a lifted ban", () => {
      const bans = new UserBans("testuser", db)
      const created = bans.create("test ban")
      const record_id = created.lastInsertRowid
      bans.lift(record_id, "all done")

      const result = bans.is_banned()

      expect(result).toBeFalsy()
    })
  })

  describe("count", () => {
    it("gets the count of bans for the user", () => {
      const bans = new UserBans("testuser", db)
      bans.create("test ban 1")
      bans.create("test ban 2")

      const result = bans.count()

      expect(result).toEqual(2)
    })
  })

  describe("detail", () => {
    it("gets the ban info", () => {
      const bans = new UserBans("testuser", db)
      const created = bans.create("test ban")
      const record_id = created.lastInsertRowid

      const record = bans.detail(record_id)

      expect(record.userFlake).toEqual("testuser")
    })
  })
})
