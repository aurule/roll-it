vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Interaction } from "../../../testing/interaction.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { UnauthorizedError } from "../../errors/unauthorized-error.js"

import { onReply, messageData } from "./bidding-defender.js"

describe("opposed defender advantages message", () => {
  let challenge
  let bidding_test

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.BiddingAttacker).withParticipants()
    bidding_test = challenge.addTest()
    bidding_test.attackerChop("rock").setTraits(15)
    bidding_test.defenderChop("rock")
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("messageData", () => {
    it("shows the bidding prompt", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("you are currently tied")
    })

    it("mentions the defender", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("<@def>")
    })

    it("shows the attacker's bid", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("bid 15 traits")
    })
  })

  describe("onReply", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.author.id = "def"
      bidding_test.attachMessage(interaction.reference.messageId)
    })

    it("rejects non-defender user", async () => {
      interaction.author.id = "asdf"

      await expect(onReply(interaction)).rejects.toThrow(UnauthorizedError)
    })

    it("with no number, replies with error", async () => {
      interaction.content = "I got nothin"

      await onReply(interaction)

      expect(interaction.replyContent).toMatch("couldn't find a number")
    })

    it("sets traits for defender's chop", async () => {
      interaction.content = "I got 15"

      await onReply(interaction)

      expect(bidding_test.defender_chop.record.traits).toEqual(15)
    })

    describe("with equal traits", () => {
      it("changes challenge state to Tying", async () => {
        interaction.content = "I got 15"

        await onReply(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.Tying)
      })

      it("shows tying message", async () => {
        interaction.content = "I got 15"

        await onReply(interaction)

        expect(interaction.replyContent).toMatch("The challenge is tied")
      })
    })

    describe("with a winner", () => {
      it("changes challenge state to Winning", async () => {
        interaction.content = "I got 11"

        await onReply(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.Winning)
      })

      it("shows winning message", async () => {
        interaction.content = "I got 11"

        await onReply(interaction)

        expect(interaction.replyContent).toMatch("is currently winning")
      })
    })
  })
})
