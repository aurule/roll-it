vitest.mock("../util/message-builders")

import { Interaction } from "../../testing/interaction.js"
import { Challenge } from "../db/opposed/challenge.js"
import cancelButton from "./opposed/cancel-button.js"
import { UnauthorizedError } from "../errors/unauthorized-error.js"
import { ChallengeFixture } from "../../testing/challenge-fixture.js"

import opposed_handler, { sanitize_id } from "./opposed.js"

describe("opposed component handler", () => {
  describe("santize_id", () => {
    it("removes trailing ids", () => {
      const id = "test_component_5"

      const result = sanitize_id(id)

      expect(result).toEqual("test_component")
    })
  })

  describe("canHandle", () => {
    it("returns true when customId matches an opposed component", () => {
      const result = opposed_handler.canHandle({ customId: "opposed_cancel" })

      expect(result).toBe(true)
    })

    it("returns true when sanitizedcustomId matches an opposed component", () => {
      const result = opposed_handler.canHandle({ customId: "opposed_cancel_5" })

      expect(result).toBe(true)
    })

    it("returns false when customId does not match an opposed component", () => {
      const result = opposed_handler.canHandle({ customId: "nope" })

      expect(result).toBe(false)
    })
  })

  describe("handle", () => {
    let interaction

    describe("with no challenge record for the message", () => {
      it("replies that the challenge is over", async () => {
        interaction = new Interaction()

        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with a challenge in a final state", () => {
      it.concurrent.each([
        ...Challenge.FinalStates,
      ])("%s: replies that the challenge is over", async (state) => {
        const interaction = new Interaction()
        new ChallengeFixture(state).attachMessage(interaction.message.id)

        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with a challenge in a non-final state, but past its timeout", () => {
      let challenge

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        challenge = new ChallengeFixture()
          .withParticipants()
          .expire()
          .attachMessage(interaction.message.id)
      })

      afterEach(() => {
        challenge.cleanup()
      })

      it("replies that the challenge is over", async () => {
        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("has concluded")
      })
    })

    describe("with a valid challenge, but for a finished test record", () => {
      let challenge

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
        challenge
          .defenderRetest("ability")
          .cancelWith("ability")
          .attachMessage(interaction.message.id)
        interaction.user.id = challenge.attacker.uid
        challenge.addTest({ gap: 2 }).setLeader(challenge.attacker)
      })

      it("replies that the message is outdated", async () => {
        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("message is outdated")
      })
    })

    describe("with a challenge in the wrong state", () => {
      let challenge

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        challenge = new ChallengeFixture(Challenge.States.Winning).withParticipants()
        challenge
          .defenderRetest("ability")
          .cancelWith("ability")
          .attachMessage(interaction.message.id)
        interaction.user.id = challenge.attacker.uid
      })

      it("replies that the message is outdated", async () => {
        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("message is outdated")
      })
    })

    describe("with a valid, current challenge", () => {
      let execute_spy
      let challenge

      beforeEach(() => {
        interaction = new Interaction()
        interaction.customId = "opposed_cancel"

        challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
        challenge.addTest().attachMessage(interaction.message.id)

        execute_spy = vitest.spyOn(cancelButton, "execute")
      })

      it("lets the component handle the interaction", async () => {
        execute_spy.mockImplementation(async () => true)

        await opposed_handler.handle(interaction)

        expect(execute_spy).toHaveBeenCalled()
      })

      it("replies with an error message when user is unauthorized", async () => {
        execute_spy.mockImplementation(async () => {
          throw new UnauthorizedError(interaction, [interaction.user.id])
        })

        await opposed_handler.handle(interaction)

        expect(interaction.replyContent).toMatch("can use this control")
      })
    })
  })
})
