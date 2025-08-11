const { Stats } = require("./stats")
const { makeDB } = require("./index")

describe("Stats db class", () => {
  let stats
  let db
  let getCommand
  let getTiming

  beforeEach(() => {
    db = makeDB()
    getCommand = db.prepare("SELECT * FROM stats.commands WHERE id = ?")
    getTiming = db.prepare("SELECT * FROM stats.timing WHERE id = ?")
    stats = new Stats(db)
  })

  describe("logCommand", () => {
    it("saves the guild id", () => {
      const inserted = stats.logCommand("testGuild", "testCommand", "en-US")

      const result = getCommand.get(inserted.lastInsertRowid)
      expect(result.guildFlake).toEqual("testGuild")
    })

    it("saves the command name", () => {
      const inserted = stats.logCommand("testGuild", "testCommand", "en-US")

      const result = getCommand.get(inserted.lastInsertRowid)
      expect(result.command).toEqual("testCommand")
    })

    it("saves the locale", () => {
      const inserted = stats.logCommand("testGuild", "testCommand", "en-US")

      const result = getCommand.get(inserted.lastInsertRowid)
      expect(result.locale).toEqual("en-US")
    })
  })

  describe("logTiming", () => {
    it("saves the event name", () => {
      const params = {
        event: "test",
        serialized: "nah",
        context: "none",
        began: 55,
        finished: 56,
      }

      const inserted = stats.logTiming(params)

      const result = getTiming.get(inserted.lastInsertRowid)
      expect(result.event).toEqual(params.event)
    })

    it("calculates the duration", () => {
      const params = {
        event: "test",
        serialized: "nah",
        context: "none",
        began: 55,
        finished: 56,
      }

      const inserted = stats.logTiming(params)

      const result = getTiming.get(inserted.lastInsertRowid)
      expect(result.duration).toEqual(1)
    })
  })
})
