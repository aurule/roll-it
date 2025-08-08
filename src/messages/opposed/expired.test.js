jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const expired = require("./expired")

describe("opposed challenge expired message", () => {
  describe("data", () => {
    let challenge

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Expired)
        .withParticipants()
        .setSummary("challenge summary")
    })

    afterEach(() => {
      challenge.cleanup()
    })

    describe("with no tests", () => {
      it("shows the empty expired message", () => {
        const result = expired.data(challenge.id)

        expect(result.content).toMatch("ran out of time")
      })
    })

    describe("with a tied final test", () => {
      beforeEach(() => {
        challenge.addTie()
      })

      it("shows the expired message", () => {
        const result = expired.data(challenge.id)

        expect(result.content).toMatch("ran out of time")
      })

      it("shows the tied state", () => {
        const result = expired.data(challenge.id)

        expect(result.content).toMatch("both were tied")
      })

      it("shows the challenge summary", () => {
        const result = expired.data(challenge.id)

        expect(result.content).toMatch("challenge summary")
      })
    })

    describe("with a winning final test", () => {
      beforeEach(() => {
        challenge.addDefenderWin()
      })

      it("shows the expired message", () => {
        const result = expired.data(challenge.id)

        expect(result.content).toMatch("ran out of time")
      })

      it("shows the winner", () => {
        const result = expired.data(challenge.id)

        expect(result.content).toMatch("<@def> was winning")
      })

      it("shows the challenge summary", () => {
        const result = expired.data(challenge.id)

        expect(result.content).toMatch("challenge summary")
      })
    })
  })
})
