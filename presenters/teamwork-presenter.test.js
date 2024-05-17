const { Collection } = require("discord.js")
const { Message } = require('../testing/message')
const { simpleflake } = require("simpleflakes")

const teamworkPresenter = require("./teamwork-presenter")

describe("teamworkPresenter", () => {
  describe("helperPromptMessage", () => {
    it("references the user", () => {
      const result = teamworkPresenter.helperPromptMessage("testflake")

      expect(result).toMatch("testflake")
    })
    it("includes description if given", () => {
      const result = teamworkPresenter.helperPromptMessage("testflake", "test description")

      expect(result).toMatch('"test description"')
    })
  })

  describe("helperRolledMessage", () => {
    it("references the user", () => {
      const message = new Message()

      const result = teamworkPresenter.helperRolledMessage("testflake", "", message)

      expect(result).toMatch("testflake")
    })
    it("includes the description if given", () => {
      const message = new Message()

      const result = teamworkPresenter.helperRolledMessage("testflake", "test description", message)

      expect(result).toMatch('"test description"')
    })
    it("links to the result message", () => {
      const message = new Message()

      const result = teamworkPresenter.helperRolledMessage("testflake", "", message)

      expect(result).toMatch(message.id.toString())
    })
  })

  describe("helperCancelledMessage", () => {
    it("references the user", () => {
      const message = new Message()

      const result = teamworkPresenter.helperCancelledMessage("testflake", "", message)

      expect(result).toMatch("testflake")
    })
    it("includes the description if given", () => {
      const message = new Message()

      const result = teamworkPresenter.helperCancelledMessage("testflake", "test description", message)

      expect(result).toMatch('"test description"')
    })
  })

  describe("helperTimeoutMessage", () => {
    it("references the user", () => {
      const message = new Message()

      const result = teamworkPresenter.helperTimeoutMessage("testflake", "", message)

      expect(result).toMatch("testflake")
    })
    it("includes the description if given", () => {
      const message = new Message()

      const result = teamworkPresenter.helperTimeoutMessage("testflake", "test description", message)

      expect(result).toMatch('"test description"')
    })
  })

  describe("leaderPromptMessage", () => {
    it("references the user", () => {
      const result = teamworkPresenter.leaderPromptMessage("testflake")

      expect(result).toMatch("testflake")
    })
  })

  describe("teamworkSummaryMessage", () => {
    it("includes the summary", () => {
      const message = new Message()
      const reactions = new Collection()

      const result = teamworkPresenter.teamworkSummaryMessage("leader summary", message)

      expect(result).toMatch("leader summary")
    })
  })

  describe("contributorEmbed", () => {
    it("includes the leader", async () => {
      const userFlake = simpleflake()
      const bonuses = new Collection()

      result = await teamworkPresenter.contributorEmbed(userFlake, 3, bonuses)

      expect(result.data.fields[0].value).toMatch(userFlake.toString())
    })
    it("includes each helper", async () => {
      const userFlake = simpleflake()
      const bonuses = new Collection([
        ['testflake', 1],
      ])

      result = await teamworkPresenter.contributorEmbed(userFlake, 3, bonuses)

      expect(result.data.fields[1].value).toMatch('testflake')
    })
  })
})