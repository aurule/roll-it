vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Interaction } from "../../../testing/interaction.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { UnauthorizedError } from "../../errors/unauthorized-error.js"

import { onReply, messageData } from "./bidding-attacker"

describe("opposed defender advantages message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.BiddingAttacker).withParticipants()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("messageData", () => {
    it("shows the bidding prompt", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("you are currently tied")
    })

    it("mentions the attacker", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("<@atk>")
    })
  })

  describe("onReply", () => {
    let interaction
    let bidding_test

    beforeEach(() => {
      interaction = new Interaction()
      interaction.author.id = "atk"
      bidding_test = challenge.addTest().attachMessage(interaction.reference.messageId)
      bidding_test.attackerChop("rock")
      bidding_test.defenderChop("rock")
    })

    it("rejects non-attacker user", async () => {
      interaction.author.id = "asdf"

      await expect(() => onReply(interaction)).rejects.toThrow(UnauthorizedError)
    })

    it("with no number, replies with error", async () => {
      interaction.content = "I got nothin"

      await onReply(interaction)

      expect(interaction.replyContent).toMatch("couldn't find a number")
    })

    it("sets traits for attacker's chop", async () => {
      interaction.content = "I got 15"

      await onReply(interaction)

      expect(bidding_test.attacker_chop.record.traits).toEqual(15)
    })

    it("changes challenge state to BiddingDefender", async () => {
      interaction.content = "I got 15"

      await onReply(interaction)

      expect(challenge.record.state).toEqual(Challenge.States.BiddingDefender)
    })

    it("shows the bidding-defender message", async () => {
      interaction.content = "I got 15"

      await onReply(interaction)

      expect(interaction.replyContent).toMatch("<@def>, you are currently tied")
    })
  })
})
