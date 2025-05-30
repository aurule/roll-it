const { GuildRollables } = require("./rollable")
const { makeDB } = require("./index")

let db

beforeEach(() => {
  db = makeDB()
})

describe("GuildRollables", () => {
  describe("create", () => {
    it("creates a new table", () => {
      const rollables = new GuildRollables("test-create", db)
      const contents = ["first", "second", "third"]

      rollables.create("test", "a test", contents)

      expect(rollables.count()).toEqual(1)
    })

    it("derives die from lines in contents", () => {
      const rollables = new GuildRollables("test-create", db)
      const contents = ["first", "second", "third"]

      const result = rollables.create("lines", "a test", contents)

      const detail = rollables.detail(result.lastInsertRowid)
      expect(detail.die).toEqual(3)
    })
  })

  describe("all", () => {
    beforeAll(() => {
      const rollables = new GuildRollables("test-all", db)
      const other_rollables = new GuildRollables("other-all", db)

      rollables.create("first", "desc1", ["one"])
      rollables.create("second", "desc2", ["one"])

      other_rollables.create("third", "desc3", ["one"])
    })

    it("gets info on all rollables for the guild", () => {
      const rollables = new GuildRollables("test-all", db)
      rollables.create("first", "desc1", ["one"])
      rollables.create("second", "desc2", ["one"])

      const result = rollables.all()

      expect(result.length).toEqual(2)
    })

    it("includes id, name, description, die", () => {
      const rollables = new GuildRollables("test-all", db)
      rollables.create("first", "desc1", ["one"])

      const result = rollables.all()

      expect(result[0].id).toBeTruthy()
      expect(result[0].name).toBeTruthy()
      expect(result[0].description).toBeTruthy()
      expect(result[0].die).toBeTruthy()
    })

    it("excludes rollables for other guilds", () => {
      const rollables = new GuildRollables("test-all", db)

      const result = rollables.all()

      const names = result.map((r) => r.name)
      expect(names).not.toContain("third")
    })
  })

  describe("detail", () => {
    it("looks up by id", () => {
      const rollables = new GuildRollables("test-detail", db)
      const insertion = rollables.create("testid", "desc", ["one"])

      const result = rollables.detail(insertion.lastInsertRowid)

      expect(result).toBeTruthy()
    })

    it("looks up by name", () => {
      const rollables = new GuildRollables("test-detail", db)
      const insertion = rollables.create("testn", "desc", ["one"])

      const result = rollables.detail(0, "testn")

      expect(result).toBeTruthy()
    })

    it("uses id when both are given", () => {
      const rollables = new GuildRollables("test-detail", db)
      const insertion = rollables.create("testb1", "desc", ["one"])
      rollables.create("testb2", "desc", ["one"])

      const result = rollables.detail(insertion.lastInsertRowid, "testb2")

      expect(result).toBeTruthy()
    })

    it("converts contents to an array", () => {
      const contents = ["first", "second", "third"]
      const rollables = new GuildRollables("test-detail", db)
      const insertion = rollables.create("test", "desc", contents)

      const result = rollables.detail(insertion.lastInsertRowid)

      expect(result.contents).toEqual(contents)
    })

    it("cannot read another guilds rollable", () => {
      const rollables = new GuildRollables("test-detail", db)
      const other_rollables = new GuildRollables("other-detail", db)
      rollables.create("first", "desc1", ["one"])
      const insertion = other_rollables.create("third", "desc3", ["one"])

      const result = rollables.detail(insertion.lastInsertRowid)

      expect(result).toBeUndefined()
    })
  })

  describe("random", () => {
    it("looks up by id", () => {
      const rollables = new GuildRollables("test-random", db)
      const insertion = rollables.create("testid", "desc", ["one"])

      const result = rollables.random(insertion.lastInsertRowid)

      expect(result).toBeTruthy()
    })

    it("looks up by name", () => {
      const rollables = new GuildRollables("test-random", db)
      const insertion = rollables.create("testn", "desc", ["one"])

      const result = rollables.random(0, "testn")

      expect(result).toBeTruthy()
    })

    it("uses id when both are given", () => {
      const rollables = new GuildRollables("test-random", db)
      const insertion = rollables.create("testb1", "desc", ["one"])
      rollables.create("testb2", "desc", ["one"])

      const result = rollables.random(insertion.lastInsertRowid, "testb2")

      expect(result).toBeTruthy()
    })

    it("gets a random line from the contents", () => {
      const contents = ["first", "second", "third"]
      const rollables = new GuildRollables("test-random", db)
      const insertion = rollables.create("test", "desc", contents)

      const result = rollables.random(insertion.lastInsertRowid)

      expect(contents).toContain(result)
    })

    it("cannot fetch from another guilds rollable", () => {
      const rollables = new GuildRollables("test-random", db)
      const other_rollables = new GuildRollables("other-random", db)
      rollables.create("first", "desc1", ["one"])
      const insertion = other_rollables.create("third", "desc3", ["one"])

      const result = rollables.random(insertion.lastInsertRowid)

      expect(result).toBeUndefined()
    })
  })

  describe("update", () => {
    it("can change the name", () => {
      const old_name = "testn"
      const new_name = "boom"
      const rollables = new GuildRollables("test-update", db)
      const insertion = rollables.create(old_name, "desc", ["one"])
      const rollableId = insertion.lastInsertRowid

      const result = rollables.update(rollableId, { name: new_name })

      const detail = rollables.detail(rollableId)
      expect(detail.name).toEqual(new_name)
    })

    it("can change the description", () => {
      const old_desc = "desc"
      const new_desc = "chair"
      const rollables = new GuildRollables("test-update", db)
      const insertion = rollables.create("testd", old_desc, ["one"])
      const rollableId = insertion.lastInsertRowid

      const result = rollables.update(rollableId, { description: new_desc })

      const detail = rollables.detail(rollableId)
      expect(detail.description).toEqual(new_desc)
    })

    it("can change the contents", () => {
      const old_contents = ["one"]
      const new_contents = ["two"]
      const rollables = new GuildRollables("test-update", db)
      const insertion = rollables.create("testc", "desc", old_contents)
      const rollableId = insertion.lastInsertRowid

      const result = rollables.update(rollableId, { contents: new_contents })

      const detail = rollables.detail(rollableId)
      expect(detail.contents).toEqual(new_contents)
    })

    it("updates die to match new contents", () => {
      const old_contents = ["one"]
      const new_contents = ["two", "three"]
      const rollables = new GuildRollables("test-update", db)
      const insertion = rollables.create("testdie", "desc", old_contents)
      const rollableId = insertion.lastInsertRowid

      const result = rollables.update(rollableId, { contents: new_contents })

      const detail = rollables.detail(rollableId)
      expect(detail.die).toEqual(2)
    })

    it("can update multiple attrs at once", () => {
      const old_name = "testm"
      const new_name = "doom"
      const old_desc = "desc"
      const new_desc = "chair"
      const rollables = new GuildRollables("test-update", db)
      const insertion = rollables.create(old_name, old_desc, ["one"])
      const rollableId = insertion.lastInsertRowid

      const result = rollables.update(rollableId, {
        name: new_name,
        description: new_desc,
      })

      const detail = rollables.detail(rollableId)
      expect(detail.name).toEqual(new_name)
      expect(detail.description).toEqual(new_desc)
    })

    it("does not change rollable for another guild", () => {
      const rollables = new GuildRollables("test-update", db)
      const old_desc = "desc"
      const new_desc = "chair"
      const other_rollables = new GuildRollables("other-update", db)
      const insertion = other_rollables.create("testg", old_desc, ["one"])
      const rollableId = insertion.lastInsertRowid

      const result = rollables.update(rollableId, { description: new_desc })

      const detail = other_rollables.detail(rollableId)
      expect(detail.description).toEqual(old_desc)
    })

    it("cannot change the id", () => {
      const rollables = new GuildRollables("test-update", db)
      const insertion = rollables.create("test", "a test", ["one"])
      const rollableId = insertion.lastInsertRowid

      const result = rollables.update(rollableId, {
        id: rollableId + 5,
        description: "new desc",
      })

      const detail = rollables.detail(rollableId + 5)
      expect(detail).toBeUndefined()
    })
  })

  describe("count", () => {
    it("gets the count of rollables for the guild", () => {
      const rollables = new GuildRollables("test-count", db)
      rollables.create("first", "desc1", ["one"])
      rollables.create("second", "desc2", ["one"])

      const result = rollables.count()

      expect(result).toEqual(2)
    })

    it("ignores other guilds rollables", () => {
      const rollables = new GuildRollables("test-count2", db)
      const other_rollables = new GuildRollables("other-count2", db)
      rollables.create("first", "desc1", ["one"])
      rollables.create("second", "desc2", ["one"])
      other_rollables.create("third", "desc3", ["one"])

      const result = rollables.count()

      expect(result).toEqual(2)
    })
  })

  describe("taken", () => {
    it("returns true if the name exists for the guild", () => {
      const rollables = new GuildRollables("test-taken", db)
      rollables.create("testt", "desc", ["one"])

      const result = rollables.taken("testt")

      expect(result).toBeTruthy()
    })

    it("returns false if the name does not exist for the guild", () => {
      const rollables = new GuildRollables("test-taken", db)

      const result = rollables.taken("testf")

      expect(result).toBeFalsy()
    })

    it("returns false if the name only exists for another guild", () => {
      const rollables = new GuildRollables("test-taken", db)
      const other_rollables = new GuildRollables("other-taken", db)
      other_rollables.create("testo", "desc", ["one"])

      const result = rollables.taken("testo")

      expect(result).toBeFalsy()
    })
  })

  describe("destroy", () => {
    it("deletes the rollable", () => {
      const rollables = new GuildRollables("test-destroy", db)
      const insertion = rollables.create("test", "desc", ["one"])
      const rollableId = insertion.lastInsertRowid

      rollables.destroy(rollableId)

      const detail = rollables.detail(rollableId)
      expect(detail).toBeUndefined()
    })

    it("cannot delete a rollable for another guild", () => {
      const rollables = new GuildRollables("test-destroy", db)
      const other_rollables = new GuildRollables("other-destroy", db)
      const insertion = other_rollables.create("test", "desc", ["one"])
      const rollableId = insertion.lastInsertRowid

      rollables.destroy(rollableId)

      const detail = other_rollables.detail(rollableId)
      expect(detail).toBeTruthy()
    })
  })
})
