const { simpleflake } = require("simpleflakes")
const { Collection } = require("discord.js")
const { Message } = require("../testing/message")
const { Interaction } = require('../testing/interaction')
const { Reaction } = require('../testing/reaction')
const { User } = require('../testing/user')

const teamwork = require("./teamwork")

describe("teamwork", () => {
  describe("increasePool", () => {
    it("skips bot reactions", () => {
      const reactions = new Collection([
        ["🔟", new Reaction("🔟", 2)]
      ])

      const result = teamwork.increasePool(1, reactions)

      expect(result.final_pool).toEqual(11)
    })
    it.each(
      teamwork.allowedEmoji
    )("adds dice for each reaction", (emoji) => {
      const reactions = new Collection([
        [emoji, new Reaction(emoji, 2)]
      ])

      const result = teamwork.increasePool(1, reactions)

      const expected = 1 + teamwork.allowedEmoji.indexOf(emoji)
      expect(result.final_pool).toEqual(expected)
    })
    it("returns the new pool", () => {
      const reactions = new Collection([
        ["🔟", new Reaction("🔟", 3)]
      ])

      const result = teamwork.increasePool(1, reactions)

      expect(result.final_pool).toEqual(21)
    })
    it("returns the reactions", () => {
      const reactions = new Collection([
        ["🔟", new Reaction("🔟", 3)]
      ])

      const result = teamwork.increasePool(1, reactions)

      expect(result.collected_reactions).toEqual(reactions)
    })
  })

  describe("makeLeaderResults", () => {
    const mockRoller = jest.fn(r => [[r]])
    const mockSummer = jest.fn(r => r[0])
    const mockPresenter = jest.fn(s => s.toString())

    it("gets results from the roller", () => {
      const result = teamwork.makeLeaderResults(
        5,
        mockRoller,
        mockSummer,
        mockPresenter
      )

      expect(mockRoller).toHaveBeenCalled()
    })
    it("gets the sum from the summer", () => {
      const result = teamwork.makeLeaderResults(
        5,
        mockRoller,
        mockSummer,
        mockPresenter
      )

      expect(mockSummer).toHaveBeenCalled()
    })
    it("gets the string from the presenter", () => {
      const result = teamwork.makeLeaderResults(
        5,
        mockRoller,
        mockSummer,
        mockPresenter
      )

      expect(mockPresenter).toHaveBeenCalled()
    })
  })

  describe("reactionFilter", () => {
    const OLD_ENV = process.env

    beforeEach(() => {
      process.env = { ...OLD_ENV }
    })

    afterAll(() => {
      process.env = OLD_ENV
    })

    it("rejects bot's reactions", () => {
      bot_flake = simpleflake()
      process.env.CLIENT_ID = bot_flake
      const user = new User(bot_flake)
      const reaction = new Reaction("🔟")

      const result = teamwork.reactionFilter(reaction, user)

      expect(result).toBeFalsy()
    })
    it("accepts user reactions", () => {
      bot_flake = simpleflake()
      process.env.CLIENT_ID = bot_flake
      user_flake = simpleflake()
      const user = new User(user_flake)
      const reaction = new Reaction("🔟")

      const result = teamwork.reactionFilter(reaction, user)

      expect(result).toBeTruthy()
    })
    it("rejects unknown emoji", () => {
      const user = new User()
      const reaction = new Reaction("😇")

      const result = teamwork.reactionFilter(reaction, user)

      expect(result).toBeFalsy()
    })
    it("accepts allowed emoji", () => {
      const user = new User()
      const reaction = new Reaction("🔟")

      const result = teamwork.reactionFilter(reaction, user)

      expect(result).toBeTruthy()
    })
  })

  describe("buttonFilter", () => {
    it("defers the update", () => {
      const userFlake = simpleflake()
      const interaction = new Interaction()
      const deferSpy = jest.spyOn(interaction, "deferUpdate")

      teamwork.buttonFilter(interaction, userFlake.toString())

      expect(deferSpy).toHaveBeenCalled()
    })
    it("returns true for the leader", () => {
      const userFlake = simpleflake()
      const interaction = new Interaction(null, userFlake)

      const result = teamwork.buttonFilter(interaction, userFlake.toString())

      expect(result).toBeTruthy()
    })
    it("returns false for others", () => {
      const userFlake = simpleflake()
      const interaction = new Interaction()

      const result = teamwork.buttonFilter(interaction, userFlake.toString())

      expect(result).toBeFalsy()
    })
  })

  describe("seedReactions", () => {
    const message = new Message()

    beforeAll(() => {
      teamwork.seedReactions(message)
    })

    it.each(
      teamwork.allowedEmoji
    )("adds a reaction for each allowed emoji", (emoji) => {
      expect(message.reactions).toContain(emoji)
    })
  })
})
