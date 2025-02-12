const { Collection } = require("discord.js")
const { Message } = require("../../testing/message")
const { simpleflake } = require("simpleflakes")
const { i18n } = require("../locales")

const teamworkPresenter = require("./teamwork-presenter")

describe("teamworkPresenter", () => {
  const t = i18n.getFixedT("en", "teamwork")

  describe("helperPromptMessage", () => {
    it("references the user", () => {
      const result = teamworkPresenter.helperPromptMessage("testflake", t)

      expect(result).toMatch("testflake")
    })
    it("includes description if given", () => {
      const result = teamworkPresenter.helperPromptMessage("testflake", t, "test description")

      expect(result).toMatch('"test description"')
    })
  })

  describe("helperProgressEmbed", () => {
    describe("requested helpers", () => {
      it("adds field when present", () => {
        const bonuses = new Collection()
        const requested = ["testflake"]

        const result = teamworkPresenter.helperProgressEmbed(bonuses, requested, t)

        expect(result.data.fields[0].name).toEqual("Requested")
      })
      it("shows an x when user has no bonus", () => {
        const bonuses = new Collection()
        const requested = ["testflake"]

        const result = teamworkPresenter.helperProgressEmbed(bonuses, requested, t)

        expect(result.data.fields[0].value).toMatch(":x:")
      })
      it("shows a check when user has a bonus", () => {
        const bonuses = new Collection([["testflake", 2]])
        const requested = ["testflake"]

        const result = teamworkPresenter.helperProgressEmbed(bonuses, requested, t)

        expect(result.data.fields[0].value).toMatch(":white_check_mark:")
      })
    })
    it("adds a field for helper bonuses", () => {
      const bonuses = new Collection([["testflake", 2]])
      const requested = []

      const result = teamworkPresenter.helperProgressEmbed(bonuses, requested, t)

      expect(result.data.fields[0].name).toEqual("Rolled")
    })
  })

  describe("helperRolledMessage", () => {
    it("references the user", () => {
      const message = new Message()

      const result = teamworkPresenter.helperRolledMessage("testflake", "", message, t)

      expect(result).toMatch("testflake")
    })
    it("includes the description if given", () => {
      const message = new Message()

      const result = teamworkPresenter.helperRolledMessage(
        "testflake",
        "test description",
        message,
        t,
      )

      expect(result).toMatch('"test description"')
    })
    it("links to the result message", () => {
      const message = new Message()

      const result = teamworkPresenter.helperRolledMessage("testflake", "", message, t)

      expect(result).toMatch(message.id.toString())
    })
  })

  describe("helperCancelledMessage", () => {
    it("references the user", () => {
      const message = new Message()

      const result = teamworkPresenter.helperCancelledMessage("testflake", "", t)

      expect(result).toMatch("testflake")
    })
    it("includes the description if given", () => {
      const message = new Message()

      const result = teamworkPresenter.helperCancelledMessage("testflake", "test description", t)

      expect(result).toMatch('"test description"')
    })
  })

  describe("helperTimeoutMessage", () => {
    it("references the user", () => {
      const message = new Message()

      const result = teamworkPresenter.helperTimeoutMessage("testflake", "", t)

      expect(result).toMatch("testflake")
    })
    it("includes the description if given", () => {
      const message = new Message()

      const result = teamworkPresenter.helperTimeoutMessage("testflake", "test description", t)

      expect(result).toMatch('"test description"')
    })
  })

  describe("leaderPromptMessage", () => {
    it("references the user", () => {
      const result = teamworkPresenter.leaderPromptMessage("testflake", t)

      expect(result).toMatch("testflake")
    })
  })

  describe("teamworkSummaryMessage", () => {
    it("includes the summary", () => {
      const message = new Message()
      const reactions = new Collection()

      const result = teamworkPresenter.teamworkSummaryMessage("leader summary", message, t)

      expect(result).toMatch("leader summary")
    })

    it("links to the message", () => {
      const message = new Message()
      const reactions = new Collection()

      const result = teamworkPresenter.teamworkSummaryMessage("leader summary", message, t)

      expect(result).toMatch(message.id.toString())
    })
  })

  describe("contributorEmbed", () => {
    it("includes the leader", async () => {
      const userFlake = simpleflake()
      const bonuses = new Collection()

      result = await teamworkPresenter.contributorEmbed(userFlake, 3, bonuses, t)

      expect(result.data.fields[0].value).toMatch(userFlake.toString())
    })
    it("includes each helper", async () => {
      const userFlake = simpleflake()
      const bonuses = new Collection([["testflake", 1]])

      result = await teamworkPresenter.contributorEmbed(userFlake, 3, bonuses, t)

      expect(result.data.fields[1].value).toMatch("testflake")
    })
  })
})
