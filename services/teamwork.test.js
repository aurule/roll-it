const teamwork = require("./teamwork")
const { Message } = require("../testing/message")
const { simpleflake } = require("simpleflakes")
const { Interaction } = require('../testing/interaction')

describe("teamwork", () => {
  describe("increasePool", () => {
    it.todo("skips bot reactions")
    it.todo("adds dice for each reaction")
    it.todo("returns the new pool")
    it.todo("returns the reactions")
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
    it.todo("rejects leader's reactions")
    it.todo("rejects bot reactions")
    it.todo("accepts user reactions")
    it.todo("rejects unknown emoji")
    it.todo("accepts allowed emoji")
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

  describe("handleTeamwork", () => {
    it.todo("replies with the assister prompt")
    it.todo("collects assister reactions")
    it.todo("shows the leader prompt")
    it.todo("gives the leader a button")

    describe("when collector finishes", () => {
      it.todo("removes the leader prompt")
      it.todo("shows the summary")
      it.todo("edits the assister prompt")
      it.todo("adds an embed to the summary")
    })
  })
})
