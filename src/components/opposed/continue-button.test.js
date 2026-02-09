vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Interaction } from "../../../testing/interaction.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { OpTest } from "../../db/opposed/optest.js"

import continueButton from "./continue-button.js"

describe("continue retest button", () => {
  describe("data", () => {
    it("has a sensible id", () => {
      const button = continueButton.data("en-US")

      expect(button.data.custom_id).toMatch("opposed_continue")
    })

    it("has a label", () => {
      const button = continueButton.data("en-US")

      expect(button.data.label).toMatch("Continue")
    })
  })

  describe("execute", () => {
    let interaction
    let challenge
    let old_test

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture().withParticipants()
      old_test = challenge.attackerRetest("item").attachMessage(interaction.message.id)
      interaction.user.id = challenge.defender.uid
      interaction.customId = "opposed_continue"
    })

    describe("authorization", () => {
      it("allows cancelling user", async () => {
        await expect(continueButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows all others", async () => {
        interaction.user.id = "other"

        await expect(continueButton.execute(interaction)).rejects.toThrow()
      })
    })

    it("edits to show cancelling inert message", async () => {
      await continueButton.execute(interaction)

      expect(interaction.replyContent).toMatch("is retesting with an item")
    })

    it("adds a new test", async () => {
      await continueButton.execute(interaction)

      const total_tests = challenge.db.testCount(challenge.id)
      expect(total_tests).toEqual(2)
    })

    it("sets state to Throwing", async () => {
      await continueButton.execute(interaction)

      expect(challenge.record.state).toEqual(Challenge.States.Throwing)
    })

    it("replies with throwing message", async () => {
      await continueButton.execute(interaction)

      expect(interaction.replyContent).toMatch("choose what you will throw")
    })
  })
})
