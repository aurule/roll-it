const Participant = require("./participant")

describe("Participant", () => {
  it("stores its user id", () => {
    const participant = new Participant("testid")

    expect(participant.id).toEqual("testid")
  })

  it("stores a mention", () => {
    const participant = new Participant("testid")

    expect(participant.mention).toEqual("<@testid>")
  })

  describe("advantages", () => {
    it.each([
      ['bomb'],
      ['ties'],
      ['cancels'],
    ])('%s defaults to false', (advantage) => {
      const participant = new Participant("testid")

      expect(participant[advantage]).toEqual(false)
    })
  })
})
