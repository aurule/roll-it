jest.mock("../util/message-builders")

const { Opposed } = require("../db/opposed")
const { Interaction } = require("../../testing/interaction")
const { Challenge } = require("../db/opposed/challenge")
const { ChallengeFixture } = require("../../testing/challenge-fixture")

const opposed = require("./opposed")

describe("opposed reply handler", () => {
  describe("canHandle", () => {
    let interaction
    let challenge

    beforeEach(() => {
      interaction = new Interaction()

      challenge = new ChallengeFixture().attachMessage(interaction.message.id)
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("true when message exists", () => {
      const result = opposed.canHandle(interaction)

      expect(result).toBe(true)
    })

    it("false when message does not exist", () => {
      const result = opposed.canHandle({ reference: { messageId: "nope" } })

      expect(result).toBe(false)
    })
  })

  describe("handle", () => {
    let opposed_db
    let interaction
    let challenge

    beforeEach(() => {
      interaction = new Interaction()

      opposed_db = new Opposed()
      challenge = new ChallengeFixture().withParticipants()
    })

    afterEach(() => {
      challenge.cleanup()
    })

    describe("retry", () => {
      beforeEach(() => {
        interaction.content = "retry"
      })

      it("replies with the current state", async () => {
        challenge.attachMessage(interaction.message.id)

        await opposed.handle(interaction)

        expect(interaction.replyContent).toMatch("you are attacking")
      })

      it("calls the afterRetry hook", async () => {
        opposed_db.setChallengeState(challenge.id, Challenge.States.Throwing)
        challenge.addTest().defenderChop("rock").attachMessage(interaction.message.id)

        await opposed.handle(interaction)

        expect(interaction.message.reactions).toContain("🛡️")
      })
    })

    describe("with a state-specific mention handler", () => {
      let interaction
      let challenge
      let bidding_test

      beforeEach(() => {
        opposed_db = new Opposed()
        challenge = new ChallengeFixture(Challenge.States.BiddingAttacker).withParticipants()
        bidding_test = challenge.addTest().attackerChop("rock")

        interaction = new Interaction()
        interaction.author.id = challenge.attacker_uid
        bidding_test.attachMessage(interaction.message.id)
      })

      afterEach(() => {
        challenge.cleanup()
      })

      it("calls the handler", async () => {
        interaction.content = "17 mental+occult"

        await opposed.handle(interaction)

        expect(bidding_test.chops[0].traits).toEqual(17)
      })
    })
  })
})
