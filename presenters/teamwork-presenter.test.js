const { Collection } = require("discord.js")
const { Message } = require('../testing/message')
const { ReactionsUserManager } = require("../testing/reactions-user-manager")
const { User } = require('../testing/user')
const { simpleflake } = require("simpleflakes")

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

      const result = teamworkPresenter.finalSummary("leader summary", message)

      expect(result).toMatch("leader summary")
    })
    it("links to the kickoff message", () => {
      const message = new Message()
      const reactions = new Collection()

      const result = teamworkPresenter.finalSummary("leader summary", message)

      expect(result).toMatch(message.id.toString())
    })
  })

  describe("contributorEmbed", () => {
    it("includes the leader", async () => {
      const userFlake = simpleflake()
      const reactions = new Collection()

      result = await teamworkPresenter.contributorEmbed(userFlake, 3, reactions)

      expect(result.data.fields[0].value).toMatch(userFlake.toString())
    })
    it("includes each helper", async () => {
      const userFlake = simpleflake()
      const helperUser = new User()
      const reactions = new Collection([
        ["🔟", {
          users: new ReactionsUserManager([helperUser])
        }]
      ])

      result = await teamworkPresenter.contributorEmbed(userFlake, 3, reactions)

      expect(result.data.fields[0].value).toMatch(helperUser.id)
    })
  })
})
