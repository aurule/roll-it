vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Interaction } from "../../../testing/interaction.js"
import { Challenge } from "../../db/opposed/challenge.js"

import relentButton from "./relent-button.js"

describe("opposed withdraw challenge button", () => {
  describe("data", () => {
    it("has a sensible label", () => {
      const component = relentButton.data("en-US")

      expect(component.data.label).toEqual("Relent")
    })
  })

  describe("execute", () => {
    let interaction
    let challenge

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture(Challenge.States.AttackerAdvantages)
        .withParticipants()
        .attachMessage(interaction.message.id)
      interaction.user.id = challenge.defender.uid
      interaction.customId = "opposed_relent"
    })

    describe("authorization", () => {
      it("allows defender", async () => {
        await expect(relentButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows others", async () => {
        interaction.user.id = "other"

        await expect(relentButton.execute(interaction)).rejects.toThrow()
      })
    })

    it("sets challenge state to relented", async () => {
      await expect(relentButton.execute(interaction)).resolves.not.toThrow()

      expect(challenge.record.state).toEqual(Challenge.States.Relented)
    })

    it("sends relented message", async () => {
      await expect(relentButton.execute(interaction)).resolves.not.toThrow()

      expect(interaction.replyContent).toMatch("**relented** to the challenge")
    })
  })
})
