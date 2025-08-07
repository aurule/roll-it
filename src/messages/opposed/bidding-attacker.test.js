jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { UnauthorizedError } = require("../../errors/unauthorized-error")
const bidding_attacker = require("./bidding-attacker")

describe("opposed defender advantages message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.BiddingAttacker).withParticipants()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("data", () => {
    it("shows the bidding prompt", () => {
      const result = bidding_attacker.data(challenge.id)

      expect(result.content).toMatch("you are currently tied")
    })

    it("mentions the attacker", () => {
      const result = bidding_attacker.data(challenge.id)

      expect(result.content).toMatch("<@atk>")
    })
  })

  describe("handleReply", () => {
    let interaction
    let bidding_test

    beforeEach(() => {
      interaction = new Interaction()
      interaction.author.id = "atk"
      bidding_test = challenge.addTest().attachMessage(interaction.reference.messageId)
      bidding_test.attackerChop("rock")
      bidding_test.defenderChop("rock")
    })

    it("rejects non-attacker user", () => {
      interaction.author.id = "asdf"

      expect(() => bidding_attacker.handleReply(interaction)).toThrow(UnauthorizedError)
    })

    it("with no number, replies with error", () => {
      interaction.content = "I got nothin"

      bidding_attacker.handleReply(interaction)

      expect(interaction.replyContent).toMatch("couldn't find a number")
    })

    it("sets traits for attacker's chop", () => {
      interaction.content = "I got 15"

      bidding_attacker.handleReply(interaction)

      expect(bidding_test.attacker_chop.record.traits).toEqual(15)
    })

    it("changes challenge state to BiddingDefender", () => {
      interaction.content = "I got 15"

      bidding_attacker.handleReply(interaction)

      expect(challenge.record.state).toEqual(Challenge.States.BiddingDefender)
    })

    it("shows the bidding-defender message", () => {
      interaction.content = "I got 15"

      bidding_attacker.handleReply(interaction)

      expect(interaction.replyContent).toMatch("<@def>, you are currently tied")
    })
  })
})
