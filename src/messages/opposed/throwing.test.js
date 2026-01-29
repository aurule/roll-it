jest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Interaction } from "../../../testing/interaction.js"
import { Challenge } from "../../db/opposed/challenge.js"
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

  describe("messageData", () => {
    describe("for the first test of a challenge", () => {
      it("shows the initial test message", () => {
        const result = throwing.messageData(challenge.id)

        expect(result.content).toMatch("first test")
      })
    })

    describe("for retests", () => {
      beforeEach(() => {
        throwing_test.retestReason("ability")
        throwing_test.retester(challenge.attacker)
        challenge.addTest({ gap: 5 })
      })

      it("shows the retest reason", () => {
        const result = throwing.messageData(challenge.id)

        expect(result.content).toMatch("a different ability")
      })
    })

    it("shows the throw request message", () => {
      const result = throwing.messageData(challenge.id)

      expect(result.content).toMatch("choose what you will throw")
    })

    it("has attacker throw picker", () => {
      const result = throwing.messageData(challenge.id)

      expect(result).toHaveComponent(`throw_symbol_picker_${challenge.attacker.id}`)
    })

    it("has defender throw picker", () => {
      const result = throwing.messageData(challenge.id)

      expect(result).toHaveComponent(`throw_symbol_picker_${challenge.defender.id}`)
    })

    it("has a go button", () => {
      const result = throwing.messageData(challenge.id)

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
