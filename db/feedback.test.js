const { makeDB } = require("./index")

const { Feedback } = require("./feedback")

let db

beforeEach(() => {
  db = makeDB()
})

describe("Feedback", () => {
  describe("create", () => {
    it("makes a new record", () => {
      const feedback = new Feedback(db)

      feedback.create({
        userId: "testuser",
        content: "testing",
      })

      expect(feedback.count()).toEqual(1)
    })

    it("saves the user ID", () => {
      const feedback = new Feedback(db)

      const result = feedback.create({
        userId: "testuser",
        content: "testing",
      })

      const detail = feedback.detail(result.lastInsertRowid)
      expect(detail.userFlake).toEqual("testuser")
    })

    it("saves the feedback contents", () => {
      const feedback = new Feedback(db)

      const result = feedback.create({
        userId: "testuser",
        content: "testing",
      })

      const detail = feedback.detail(result.lastInsertRowid)
      expect(detail.content).toEqual("testing")
    })

    describe("optional fields", () => {
      it("saves the guild ID when present", () => {
        const feedback = new Feedback(db)

        const result = feedback.create({
          userId: "testuser",
          content: "testing",
          guildId: "testguild",
        })

        const detail = feedback.detail(result.lastInsertRowid)
        expect(detail.guildFlake).toEqual("testguild")
      })

      it("saves the command name if present", () => {
        const feedback = new Feedback(db)

        const result = feedback.create({
          userId: "testuser",
          content: "testing",
          commandName: "d20",
        })

        const detail = feedback.detail(result.lastInsertRowid)
        expect(detail.commandName).toEqual("d20")
      })

      it("notes if replies are allowed", () => {
        const feedback = new Feedback(db)

        const result = feedback.create({
          userId: "testuser",
          content: "testing",
          canReply: true,
        })

        const detail = feedback.detail(result.lastInsertRowid)
        expect(detail.canReply).toBeTruthy()
      })
    })
  })

  describe("count", () => {
    it("counts all feedback records", () => {
      const feedback = new Feedback(db)
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
      const feedback = new Feedback(db)
      const record_output = feedback.create({
        userId: "test1",
        content: "testing",
      })
      const record_id = record_output.lastInsertRowid

      const result = feedback.detail(record_id)

      expect(result.userFlake).toEqual("test1")
    })

    it("ensures canReply is a boolean", () => {
      const feedback = new Feedback(db)
      const record_output = feedback.create({
        userId: "test1",
        content: "testing",
      })
      const record_id = record_output.lastInsertRowid

      const result = feedback.detail(record_id)

      expect(result.canReply).toEqual(false)
    })

    it("returns undefined on bad id", () => {
      const feedback = new Feedback(db)

      const result = feedback.detail(25)

      expect(result).toBeUndefined()
    })
  })
})
