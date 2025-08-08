jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const throwing = require("./throwing")

describe("opposed throwing prompt message", () => {
  let challenge
  let throwing_test

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Throwing)
      .withParticipants()
      .setSummary("test summary")
    throwing_test = challenge.addTest()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("data", () => {
    it("shows the throw request message", () => {
      const result = throwing.data(challenge.id)

      expect(result.content).toMatch("choose what you will throw")
    })

    it("has attacker throw picker", () => {
      const result = throwing.data(challenge.id)

      expect(result).toHaveComponent(`throw_symbol_picker_${challenge.attacker.id}`)
    })

    it("has defender throw picker", () => {
      const result = throwing.data(challenge.id)

      expect(result).toHaveComponent(`throw_symbol_picker_${challenge.defender.id}`)
    })

    it("has a go button", () => {
      const result = throwing.data(challenge.id)

      expect(result).toHaveComponent("go_button")
    })
  })

  describe("afterRetry", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
      throwing_test.attachMessage(interaction.message.id)
    })

    describe("with no chops", () => {
      it("does not add reactions", async () => {
        await throwing.afterRetry(interaction.message)

        expect(interaction.message.reactions).toEqual([])
      })
    })

    describe("with an attacker chop", () => {
      beforeEach(() => {
        throwing_test.attackerChop("paper")
      })

      it("reacts with the dagger emoji", async () => {
        await throwing.afterRetry(interaction.message)

        expect(interaction.message.reactions).toContain("🗡️")
      })
    })

    describe("with a defender chop", () => {
      beforeEach(() => {
        throwing_test.defenderChop("paper")
      })

      it("reacts with the shield emoji", async () => {
        await throwing.afterRetry(interaction.message)

        expect(interaction.message.reactions).toContain("🛡️")
      })
    })

    describe("with both chops", () => {
      beforeEach(() => {
        throwing_test.attackerChop("rock")
        throwing_test.defenderChop("paper")
      })

      it("reacts with dagger and shield emojis", async () => {
        await throwing.afterRetry(interaction.message)

        expect(interaction.message.reactions).toContain("🗡️")
        expect(interaction.message.reactions).toContain("🛡️")
      })
    })
  })
})
