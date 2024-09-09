const { Stats } = require("./stats")
const { makeDB } = require("./index")

let db
let getOne

beforeEach(() => {
  db = makeDB()
  getOne = db.prepare("SELECT * FROM stats.commands WHERE id = @id")

})


describe("Stats", () => {
  describe("logCommand", () => {
    it("saves the guild id", () => {
      const stats = new Stats(db)

      const inserted = stats.logCommand("testGuild", "testCommand")

      const result = getOne.get({id: inserted.lastInsertRowid})
      expect(result.guildFlake).toEqual("testGuild")
    })

    it("saves the command name", () => {
      const stats = new Stats(db)

      const inserted = stats.logCommand("testGuild", "testCommand")

      const result = getOne.get({id: inserted.lastInsertRowid})
      expect(result.command).toEqual("testCommand")
    })
  })
})
