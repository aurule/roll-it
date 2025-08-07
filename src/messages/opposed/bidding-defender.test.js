jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { UnauthorizedError } = require("../../errors/unauthorized-error")
const bidding_defender = require("./bidding-defender")

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

  describe("data", () => {
    it("shows the bidding prompt", () => {
      const result = bidding_defender.data(challenge.id)

      expect(result.content).toMatch("you are currently tied")
    })

    it("mentions the defender", () => {
      const result = bidding_defender.data(challenge.id)

      expect(result.content).toMatch("<@def>")
    })

    it("shows the attacker's bid", () => {
      const result = bidding_defender.data(challenge.id)

      expect(result.content).toMatch("bid 15 traits")
    })
  })

  describe("handleReply", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.author.id = "def"
      bidding_test.attachMessage(interaction.reference.messageId)
    })

    it("rejects non-defender user", () => {
      interaction.author.id = "asdf"

      expect(() => bidding_defender.handleReply(interaction)).toThrow(UnauthorizedError)
    })

    it("with no number, replies with error", () => {
      interaction.content = "I got nothin"

      bidding_defender.handleReply(interaction)

      expect(interaction.replyContent).toMatch("couldn't find a number")
    })

    it("sets traits for defender's chop", () => {
      interaction.content = "I got 15"

      bidding_defender.handleReply(interaction)

      expect(bidding_test.defender_chop.record.traits).toEqual(15)
    })

    describe("with equal traits", () => {
      it("changes challenge state to Tying", () => {
        interaction.content = "I got 15"

        bidding_defender.handleReply(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.Tying)
      })

      it("shows tying message", () => {
        interaction.content = "I got 15"

        bidding_defender.handleReply(interaction)

        expect(interaction.replyContent).toMatch("The challenge is tied")
      })
    })

    describe("with a winner", () => {
      it("changes challenge state to Winning", () => {
        interaction.content = "I got 11"

        bidding_defender.handleReply(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.Winning)
      })

      it("shows winning message", () => {
        interaction.content = "I got 11"

        bidding_defender.handleReply(interaction)

        expect(interaction.replyContent).toMatch("is currently winning")
      })
    })
  })
})
