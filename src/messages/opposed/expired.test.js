vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"
const expired = require("./expired")

describe("opposed challenge expired message", () => {
  describe("messageData", () => {
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
        const result = expired.messageData(challenge.id)

        expect(result.content).toMatch("ran out of time")
      })
    })

    describe("with a tied final test", () => {
      beforeEach(() => {
        challenge.addTie()
      })

      it("shows the expired message", () => {
        const result = expired.messageData(challenge.id)

        expect(result.content).toMatch("ran out of time")
      })

      it("shows the tied state", () => {
        const result = expired.messageData(challenge.id)

        expect(result.content).toMatch("both were tied")
      })

      it("shows the challenge summary", () => {
        const result = expired.messageData(challenge.id)

        expect(result.content).toMatch("challenge summary")
      })
    })

    describe("with a winning final test", () => {
      beforeEach(() => {
        challenge.addDefenderWin()
      })

      it("shows the expired message", () => {
        const result = expired.messageData(challenge.id)

        expect(result.content).toMatch("ran out of time")
      })

      it("shows the winner", () => {
        const result = expired.messageData(challenge.id)

        expect(result.content).toMatch("<@def> was winning")
      })

      it("shows the challenge summary", () => {
        const result = expired.messageData(challenge.id)

        expect(result.content).toMatch("challenge summary")
      })
    })
  })
})
