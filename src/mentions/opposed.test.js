vitest.mock("../util/message-builders")

import { Opposed } from "../db/opposed.js"
import { Interaction } from "../../testing/interaction.js"
import { Message } from "../../testing/message.js"
import { Challenge } from "../db/opposed/challenge.js"
import { ChallengeFixture } from "../../testing/challenge-fixture.js"
import "../messages/opposed/index.js"

import { OpposedMentionHandler } from "./opposed.js"

describe("opposed reply handler", () => {
  describe("canHandle", () => {
    /**
     * @type Interaction
     */
    let interaction

    /**
     * @type ChallengeFixture
     */
    let challenge

    beforeEach(() => {
      interaction = new Interaction()

      challenge = new ChallengeFixture().attachMessage(interaction.message.id)
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("true when message exists", () => {
      const result = OpposedMentionHandler.canHandle(interaction)

      expect(result).toBe(true)
    })

    it("false when message does not exist", () => {
      const result = OpposedMentionHandler.canHandle({ reference: { messageId: "nope" } })

      expect(result).toBe(false)
    })
  })

  describe("handle", () => {
    /**
     * @type Opposed
     */
    let opposed_db

    /**
     * @type Interaction
     */
    let interaction

    /**
     * @type ChallengeFixture
     */
    let challenge

    /**
     * @type Message
     */
    let bot_message

    beforeEach(() => {
      interaction = new Interaction()
      bot_message = new Message()
      interaction.message.reference = {
        messageId: bot_message.id
      }

      opposed_db = new Opposed()
      challenge = new ChallengeFixture().withParticipants()
    })

    afterEach(() => {
      challenge.cleanup()
    })

    describe("retry", () => {
      beforeEach(() => {
        interaction.message.content = "retry"
      })

      it("replies with the current state", async () => {
        challenge.attachMessage(bot_message.id)
        const opposed = new OpposedMentionHandler(interaction.message)

        await opposed.handle()

        expect(interaction.replyContent).toMatch("you are attacking")
      })

      it("calls the afterRetry hook", async () => {
        opposed_db.setChallengeState(challenge.id, Challenge.States.Throwing)
        const after_test = challenge.addTest().attachMessage(bot_message.id)
        after_test.defenderChop("rock")
        const opposed = new OpposedMentionHandler(interaction.message)

        await opposed.handle()

        expect(interaction.message.reactions).toContain("🛡️")
      })
    })

    describe("with a state-specific mention handler", () => {
      let bidding_test

      beforeEach(() => {
        challenge.setState(Challenge.States.BiddingAttacker)
        bidding_test = challenge.addTest()
        bidding_test.attackerChop("rock")

        interaction.author.id = challenge.attacker_uid
        bidding_test.attachMessage(bot_message.id)
      })

      afterEach(() => {
        challenge.cleanup()
      })

      it("calls the handler", async () => {
        interaction.content = "17 mental+occult"
        const opposed = new OpposedMentionHandler(interaction.message)

        await opposed.handle()

        expect(bidding_test.attacker_chop.record.traits).toEqual(17)
      })
    })

    describe("with no mention handler", () => {
      it("shows a generic message", async () => {
        challenge.attachMessage(bot_message.id)
        interaction.content = "17 mental+occult"
        const opposed = new OpposedMentionHandler(interaction.message)

        await opposed.handle()

        expect(interaction.replyContent).toMatch("did not understand")
      })
    })
  })
})
