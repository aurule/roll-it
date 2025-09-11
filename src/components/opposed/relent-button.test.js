jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")

const relentButton = require("./relent-button")

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
