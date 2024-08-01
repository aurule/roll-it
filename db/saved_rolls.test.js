const { makeUpdateFields, UserSavedRolls } = require("./saved_rolls")
const { makeDB } = require("./index")

function fakeSavedRoll(saved_rolls, data) {
  return saved_rolls.create({
    name: "test1",
    description: "test1",
    command: "roll",
    options: {
      pool: 1,
      sides: 6,
    },
    ...data,
  })
}

let db

beforeEach(() => {
  db = makeDB()
})

describe("makeUpdateFields", () => {
  it("generates fields", () => {
    const data = {
      test: "test",
    }

    const result = makeUpdateFields(data)

    expect(result.fields).toContain("test")
  })

  it("generates placeholders", () => {
    const data = {
      test: "test",
    }

    const result = makeUpdateFields(data)

    expect(result.placeholders).toContain("@test")
  })

  it("generates values", () => {
    const data = {
      test: "test",
    }

    const result = makeUpdateFields(data)

    expect(result.values.test).toMatch("test")
  })

  it("converts options", () => {
    const data = {
      options: {test: true},
    }

    const result = makeUpdateFields(data)

    expect(result.fields).toContain("options")
    expect(result.placeholders).toContain("JSONB(@options)")
    expect(result.values.options).toMatch(JSON.stringify(data.options))
  })

  it("forces flag to be integer", () => {
    const data = {
      incomplete: true,
    }

    const result = makeUpdateFields(data)

    expect(result.values.incomplete).toEqual(1)
  })
})

describe("UserSavedRolls", () => {
  describe("create", () => {
    it("creates a new saved roll", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-create", db)

      const result = saved_rolls.create({
        name: "test1",
        description: "test1",
        command: "roll",
        options: {
          pool: 1,
          sides: 6,
        },
      })

      expect(saved_rolls.count()).toEqual(1)
    })
  })

  describe("upsert", () => {
    it("inserts a new complete record", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-upsert", db)
      const data = {
        name: "test roll",
        description: "a test",
        command: "d20",
        options: {},
      }

      saved_rolls.upsert(data)

      expect(saved_rolls.count()).toEqual(1)
    })

    describe("with no incomplete roll", () => {
      it("inserts a new incomplete record", () => {
        const saved_rolls = new UserSavedRolls("test-guild", "user-upsert", db)
        const data = {
          name: "test roll",
          description: "a test",
          incomplete: true,
        }

        saved_rolls.upsert(data)

        expect(saved_rolls.count()).toEqual(1)
      })
    })

    describe("with an incomplete roll", () => {
      it("updates the existing incomplete record", () => {
        const saved_rolls = new UserSavedRolls("test-guild", "user-upsert", db)
        fakeSavedRoll(saved_rolls, {incomplete: true})
        const data = {
          name: "test roll",
          description: "a test",
          incomplete: true,
        }

        saved_rolls.upsert(data)

        expect(saved_rolls.count()).toEqual(1)
      })
    })
  })

  describe("all", () => {
    it("lists all the user's rolls in this guild", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-all", db)
      fakeSavedRoll(saved_rolls, {name: "test1"})
      fakeSavedRoll(saved_rolls, {name: "test2"})
      fakeSavedRoll(saved_rolls, {name: "test3"})

      const result = saved_rolls.all()

      expect(result.length).toEqual(3)
    })

    it("extracts options from jsonb", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-all", db)
      fakeSavedRoll(saved_rolls, {name: "test1"})

      const result = saved_rolls.all()

      expect(result[0].options.pool).toEqual(1)
    })
  })

  describe("detail", () => {
    it("looks up by id", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-detail", db)
      const insertion = fakeSavedRoll(saved_rolls)

      const result = saved_rolls.detail(insertion.lastInsertRowid)

      expect(result).toBeTruthy()
    })

    it("looks up by name", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-detail", db)
      const insertion = fakeSavedRoll(saved_rolls, {name: "testn"})

      const result = saved_rolls.detail(0, "testn")

      expect(result).toBeTruthy()
    })

    it("uses id when both are given", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-detail", db)
      const insertion = fakeSavedRoll(saved_rolls, {name: "testb2"})

      const result = saved_rolls.detail(insertion.lastInsertRowid, "testb2")

      expect(result).toBeTruthy()
    })

    it("converts options to an array", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-detail", db)
      const options = {
        pool: 1,
        sides: 6,
      }
      const insertion = fakeSavedRoll(saved_rolls, {options: options})

      const result = saved_rolls.detail(insertion.lastInsertRowid)

      expect(result.options).toEqual(options)
    })

    it("cannot read another guild's saved roll for the same user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-detail", db)
      const other_saved_rolls = new UserSavedRolls("test-guild", "user-detail-other", db)
      const insertion = fakeSavedRoll(saved_rolls)

      const result = other_saved_rolls.detail(insertion.lastInsertRowid)

      expect(result).toBeUndefined()
    })

    it("cannot read another user's saved roll for the same guild", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-detail", db)
      const other_saved_rolls = new UserSavedRolls("test-guild-other", "user-detail", db)
      const insertion = fakeSavedRoll(saved_rolls)

      const result = other_saved_rolls.detail(insertion.lastInsertRowid)

      expect(result).toBeUndefined()
    })
  })

  describe("update", () => {
    it.each([
      ["name", "new name"],
      ["description", "new description"],
      ["command", "d20"],
      ["options", {modifier: 55}],
      ["incomplete", true],
      ["invalid", true],
    ])("can update the %s", (field, new_value) => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-update", db)
      const insertion = fakeSavedRoll(saved_rolls)
      const roll_id = insertion.lastInsertRowid
      const data = {}
      data[field] = new_value

      saved_rolls.update(roll_id, data)

      const updated_roll = saved_rolls.detail(roll_id)
      expect(updated_roll[field]).toEqual(new_value)
    })

    it("can update multiple values", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-update", db)
      const insertion = fakeSavedRoll(saved_rolls)
      const roll_id = insertion.lastInsertRowid
      const data = {
        name: "new name",
        description: "new description",
      }

      saved_rolls.update(roll_id, data)

      const updated_roll = saved_rolls.detail(roll_id)
      expect(updated_roll.name).toEqual(data.name)
      expect(updated_roll.description).toEqual(data.description)
    })

    it("cannot update another user's saved roll", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-update", db)
      const other_saved_rolls = new UserSavedRolls("test-guild", "user-update-other", db)
      const insertion = fakeSavedRoll(saved_rolls)
      const roll_id = insertion.lastInsertRowid
      const data = {
        name: "new name",
      }

      other_saved_rolls.update(roll_id, data)

      const updated_roll = saved_rolls.detail(roll_id)
      expect(updated_roll.name).toEqual("test1")
    })
  })

  describe("count", () => {
    it("gets the count of saved rolls for the guild", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-count", db)
      fakeSavedRoll(saved_rolls, {name: "test1"})
      fakeSavedRoll(saved_rolls, {name: "test2"})

      const result = saved_rolls.count()

      expect(result).toEqual(2)
    })

    it("ignores other guild's saved rolls for the same user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-count", db)
      const other_saved_rolls = new UserSavedRolls("test-guild-other", "user-count", db)
      fakeSavedRoll(saved_rolls, {name: "test1"})
      fakeSavedRoll(other_saved_rolls, {name: "test2"})

      const result = saved_rolls.count()

      expect(result).toEqual(1)
    })

    it("ignores other user's saved rolls in the same guild", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-count1", db)
      const other_saved_rolls = new UserSavedRolls("test-guild", "user-count2", db)
      fakeSavedRoll(saved_rolls, {name: "test1"})
      fakeSavedRoll(other_saved_rolls, {name: "test2"})

      const result = saved_rolls.count()

      expect(result).toEqual(1)
    })
  })

  describe("taken", () => {
    it("returns true if the name exists for the guild and user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-taken", db)
      fakeSavedRoll(saved_rolls, {name: "test"})

      const result = saved_rolls.taken("test")

      expect(result).toBeTruthy()
    })

    it("returns false if the name only exists on an incomplete roll for the guild and user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-taken", db)
      fakeSavedRoll(saved_rolls, {name: "test", incomplete: true})

      const result = saved_rolls.taken("test")

      expect(result).toBeFalsy()
    })

    it("returns false if the name does not exist for the guild and user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-taken", db)
      fakeSavedRoll(saved_rolls, {name: "test"})

      const result = saved_rolls.taken("nope")

      expect(result).toBeFalsy()
    })

    it("returns false if the name only exists for another guild but same user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-taken", db)
      const other_saved_rolls = new UserSavedRolls("test-guild-other", "user-taken", db)
      fakeSavedRoll(other_saved_rolls, {name: "test"})

      const result = saved_rolls.taken("test")

      expect(result).toBeFalsy()
    })

    it("returns false if the name only exists for same guild but another user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-taken", db)
      const other_saved_rolls = new UserSavedRolls("test-guild", "user-taken-other", db)
      fakeSavedRoll(other_saved_rolls, {name: "test"})

      const result = saved_rolls.taken("test")

      expect(result).toBeFalsy()
    })
  })

  describe("destroy", () => {
    it("deletes the saved roll", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-destroy", db)
      const insertion = fakeSavedRoll(saved_rolls)
      const roll_id = insertion.lastInsertRowid

      saved_rolls.destroy(roll_id)

      const detail = saved_rolls.detail(roll_id)
      expect(detail).toBeUndefined()
    })

    it("cannot delete a saved roll for another guild but the same user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-destroy", db)
      const other_saved_rolls = new UserSavedRolls("test-guild-other", "user-destroy", db)
      const insertion = fakeSavedRoll(saved_rolls)
      const roll_id = insertion.lastInsertRowid

      other_saved_rolls.destroy(roll_id)

      const detail = saved_rolls.detail(roll_id)
      expect(detail).toBeTruthy()
    })

    it("cannot delete a saved roll for the same guild but another user", () => {
      const saved_rolls = new UserSavedRolls("test-guild", "user-destroy", db)
      const other_saved_rolls = new UserSavedRolls("test-guild", "user-destroy-other", db)
      const insertion = fakeSavedRoll(saved_rolls)
      const roll_id = insertion.lastInsertRowid

      other_saved_rolls.destroy(roll_id)

      const detail = saved_rolls.detail(roll_id)
      expect(detail).toBeTruthy()
    })
  })
})
