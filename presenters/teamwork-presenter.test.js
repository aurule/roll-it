const { Collection } = require("discord.js")
const { Message } = require('../testing/message')

const teamworkPresenter = require("./teamwork-presenter")

describe("teamworkPresenter", () => {
  describe("promptAssisters", () => {
    it("references the user", () => {
      const result = teamworkPresenter.promptAssisters("testflake")

      expect(result).toMatch("testflake")
    })
    it("includes description if given", () => {
      const result = teamworkPresenter.promptAssisters("testflake", "test description")

      expect(result).toMatch('"test description"')
    })
  })

  describe("afterAssisters", () => {
    it("references the user", () => {
      const message = new Message()

      const result = teamworkPresenter.afterAssisters("testflake", "", message)

      expect(result).toMatch("testflake")
    })
    it("includes the description if given", () => {
      const message = new Message()

      const result = teamworkPresenter.afterAssisters("testflake", "test description", message)

      expect(result).toMatch('"test description"')
    })
    it("links to the result message", () => {
      const message = new Message()

      const result = teamworkPresenter.afterAssisters("testflake", "", message)

      expect(result).toMatch(message.id.toString())
    })
  })

  describe("showButton", () => {
    it("references the user", () => {
      const result = teamworkPresenter.showButton("testflake")

      expect(result).toMatch("testflake")
    })
  })

  describe("finalSummary", () => {
    it("includes the summary", () => {
      const message = new Message()
      const reactions = new Collection()

      const result = teamworkPresenter.finalSummary({
        leaderRollSummary: "leader summary",
        initialPool: 3,
        contributions: reactions,
        leaderMessage: message,
      })

      expect(result).toMatch("leader summary")
    })
    it("links to the kickoff message", () => {
      const message = new Message()
      const reactions = new Collection()

      const result = teamworkPresenter.finalSummary({
        leaderRollSummary: "leader summary",
        initialPool: 3,
        contributions: reactions,
        leaderMessage: message,
      })

      expect(result).toMatch(message.id.toString())
    })
    describe("contributor breakdown", () => {
      it("includes the leader", () => {
        const message = new Message()
        const reactions = new Collection()

        const result = teamworkPresenter.finalSummary({
          leaderRollSummary: "leader summary",
          initialPool: 3,
          contributions: reactions,
          leaderMessage: message,
        })

        expect(result).toMatch("3 dice")
      })
      it.todo("includes each helper")
    })
  })
})
