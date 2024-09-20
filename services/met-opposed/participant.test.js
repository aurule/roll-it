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

  it("bomb defaults to false", () => {
    const participant = new Participant("testid")

    expect(participant.bomb).toBeFalsy()
  })

  it("ties defaults to false", () => {
    const participant = new Participant("testid")

    expect(participant.ties).toBeFalsy()
  })
})
