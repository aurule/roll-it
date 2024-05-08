const { simpleflake } = require("simpleflakes")
const { Collection } = require("discord.js")

const teamwork = require("./teamwork")

describe("teamwork", () => {
  describe("increasePool", () => {
    it("adds all bonuses", () => {
      const bonuses = new Collection([
        ['testflake', 1],
        ['testflake2', 1],
      ])

      const result = teamwork.increasePool(1, bonuses)

      expect(result).toEqual(3)
    })
    it("handles no bonuses", () => {
      const bonuses = new Collection()

      const result = teamwork.increasePool(1, bonuses)

      expect(result).toEqual(1)
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

  describe("bonusesFromSelections", () => {
    it("sums all bonuses for a user", () => {
      const selections = new Collection([['testflake', ['+1', '+2']]])

      const result = teamwork.bonusesFromSelections(selections)

      expect(result.first()).toEqual(3)
    })
    it("handles one bonus for a user", () => {
      const selections = new Collection([['testflake', ['+1']]])

      const result = teamwork.bonusesFromSelections(selections)

      expect(result.first()).toEqual(1)
    })
  })
})
