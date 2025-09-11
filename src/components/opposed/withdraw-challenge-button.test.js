jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")

const withdrawChallengeButton = require("./withdraw-challenge-button")

describe("opposed withdraw challenge button", () => {
  describe("data", () => {
    it("has a sensible label", () => {
      const component = withdrawChallengeButton.data("en-US")

      expect(component.data.label).toEqual("Withdraw")
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
      interaction.user.id = challenge.attacker.uid
      interaction.customId = "opposed_withdraw_challenge"
    })

    describe("authorization", () => {
      it("allows attacker", async () => {
        await expect(withdrawChallengeButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows others", async () => {
        interaction.user.id = "other"

        await expect(withdrawChallengeButton.execute(interaction)).rejects.toThrow()
      })
    })

    it("sets challenge state to withdrawn", async () => {
      await expect(withdrawChallengeButton.execute(interaction)).resolves.not.toThrow()

      expect(challenge.record.state).toEqual(Challenge.States.Withdrawn)
    })

    it("sends withdrawn message", async () => {
      await expect(withdrawChallengeButton.execute(interaction)).resolves.not.toThrow()

      expect(interaction.replyContent).toMatch("withdrew their challenge")
    })
  })
})
