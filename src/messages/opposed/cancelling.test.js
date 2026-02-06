vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { Participant } from "../../db/opposed/participant.js"
const cancelling = require("./cancelling")

describe("opposed cancelling a retest message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
    challenge.attackerRetest("ability")
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("messageData", () => {
    it("shows the retest reason", () => {
      const result = cancelling.messageData(challenge.id)

      expect(result.content).toMatch("retesting with an ability")
    })

    it("has a withdraw cancel button", () => {
      const result = cancelling.messageData(challenge.id)

      expect(result).toHaveComponent("opposed_withdraw_retest")
    })

    it("has a cancel button", () => {
      const result = cancelling.messageData(challenge.id)

      expect(result).toHaveComponent("opposed_cancel")
    })

    describe("with 'cancels' advantage", () => {
      beforeEach(() => {
        challenge.defender.setAdvantages([Participant.Advantages.Cancels])
      })

      it("shows cancel reason picker", () => {
        const result = cancelling.messageData(challenge.id)

        expect(result).toHaveComponent("opposed_cancel_select")
      })

      it("shows cancels disclaimer", () => {
        const result = cancelling.messageData(challenge.id)

        expect(result.content).toMatch("you will see this prompt for every retest")
      })
    })
  })

  describe("inert", () => {
    it("shows the retest reason", () => {
      const result = cancelling.inertMessageData(challenge.id)

      expect(result.content).toMatch("retesting with an ability")
    })

    describe("actions", () => {
      it.each([
        ["withdraw", "withdrew their retest"],
        ["cancel", "cancelled"],
        ["continue", "retesting with"],
      ])("%s action shows appropriate content", (action, content) => {
        const result = cancelling.inertMessageData(challenge.id, action)

        expect(result.content).toMatch(content)
      })
    })

    it("has no components", () => {
      const result = cancelling.inertMessageData(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
