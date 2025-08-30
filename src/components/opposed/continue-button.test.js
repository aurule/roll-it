jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { OpTest } = require("../../db/opposed/optest")

const continueButton = require("./continue-button")

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

    it.todo("adds a new test")

    it.todo("sets state to Throwing")

    it.todo("replies with throwing message")
  })
})
