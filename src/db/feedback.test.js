const { makeDB } = require("./index")

const { Feedback } = require("./feedback")

let db

beforeEach(() => {
  db = makeDB()
})

describe("Feedback", () => {
  let feedback

  beforeEach(() => {
    feedback = new Feedback(db)
  })

  describe("create", () => {
    it("makes a new record", () => {
      feedback.create({
        userId: "testuser",
        content: "testing",
      })

      expect(feedback.count()).toEqual(1)
    })

    it("saves the user ID", () => {
      const result = feedback.create({
        userId: "testuser",
        content: "testing",
      })

      const detail = feedback.detail(result.lastInsertRowid)
      expect(detail.userFlake).toEqual("testuser")
    })

    it("saves the feedback contents", () => {
      const result = feedback.create({
        userId: "testuser",
        content: "testing",
      })

      const detail = feedback.detail(result.lastInsertRowid)
      expect(detail.content).toEqual("testing")
    })

    describe("optional fields", () => {
      it("saves the guild ID when present", () => {
        const result = feedback.create({
          userId: "testuser",
          content: "testing",
          guildId: "testguild",
        })

        const detail = feedback.detail(result.lastInsertRowid)
        expect(detail.guildFlake).toEqual("testguild")
      })

      it("saves the command name if present", () => {
        const result = feedback.create({
          userId: "testuser",
          content: "testing",
          commandName: "d20",
        })

        const detail = feedback.detail(result.lastInsertRowid)
        expect(detail.commandName).toEqual("d20")
      })

      it("notes if replies are allowed", () => {
        const result = feedback.create({
          userId: "testuser",
          content: "testing",
          canReply: true,
        })

        const detail = feedback.detail(result.lastInsertRowid)
        expect(detail.canReply).toBeTruthy()
      })

      it("saves the locale", () => {
        const result = feedback.create({
          userId: "testuser",
          content: "testing",
          canReply: true,
          locale: "en-US",
        })

        const detail = feedback.detail(result.lastInsertRowid)
        expect(detail.locale).toEqual("en-US")
      })
    })
  })

  describe("addNotes", () => {
    describe("with a valid record", () => {
      const userId = "testUser"
      let record_id

      beforeEach(() => {
        const result = feedback.create({
          userId,
          guildId: "testGuild",
          content: "old content",
          commandName: "roll",
          canReply: false,
          locale: "en-US",
        })
        record_id = result.lastInsertRowid
      })

      it("sets consent", () => {
        feedback.addNotes({
          id: record_id,
          userId,
          notes: "new stuff",
          canReply: true,
        })

        const record = feedback.detail(record_id)
        expect(record.canReply).toEqual(true)
      })

      it("prepends notes to existing content", () => {
        feedback.addNotes({
          id: record_id,
          userId,
          notes: "new stuff",
          canReply: true,
        })

        const record = feedback.detail(record_id)
        expect(record.content).toMatch("new")
        expect(record.content).toMatch("old")
      })
    })

    describe("with an invalid record", () => {
      const userId = "testUser"
      let record_id

      beforeEach(() => {
        const result = feedback.create({
          userId,
          guildId: "testGuild",
          content: "old content",
          commandName: "roll",
          canReply: false,
          locale: "en-US",
        })
        record_id = result.lastInsertRowid
      })

      it("makes no changes", () => {
        const result = feedback.addNotes({
          id: record_id,
          userId: "otherUser",
          notes: "new stuff",
          canReply: true,
        })

        expect(result.changes).toEqual(0)
      })
    })

    describe("with a missing record", () => {
      const userId = "testUser"
      const record_id = 12

      it("makes no changes", () => {
        const result = feedback.addNotes({
          id: record_id,
          userId,
          notes: "new stuff",
          canReply: true,
        })

        expect(result.changes).toEqual(0)
      })
    })
  })

  describe("count", () => {
    it("counts all feedback records", () => {
      feedback.create({
        userId: "test1",
        content: "testing",
      })
      feedback.create({
        userId: "test1",
        content: "testing",
      })

      const result = feedback.count()

      expect(result).toEqual(2)
    })
  })

  describe("detail", () => {
    it("gets a single record", () => {
      const record_output = feedback.create({
        userId: "test1",
        content: "testing",
      })
      const record_id = record_output.lastInsertRowid

      const result = feedback.detail(record_id)

      expect(result.userFlake).toEqual("test1")
    })

    it("ensures canReply is a boolean", () => {
      const record_output = feedback.create({
        userId: "test1",
        content: "testing",
      })
      const record_id = record_output.lastInsertRowid

      const result = feedback.detail(record_id)

      expect(result.canReply).toEqual(false)
    })

    it("returns undefined on bad id", () => {
      const result = feedback.detail(25)

      expect(result).toBeUndefined()
    })
  })

  describe("all", () => {
    it("lists all feedback records", () => {
      feedback.create({
        userId: "test1",
        content: "testing",
      })
      feedback.create({
        userId: "test2",
        content: "testing",
      })

      const result = feedback.all()

      expect(result.length).toEqual(2)
    })

    it("converts canReply to a boolean", () => {
      feedback.create({
        userId: "test1",
        content: "testing",
      })

      const result = feedback.all()

      expect(result[0].canReply).toEqual(false)
    })
  })
})
