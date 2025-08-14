jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { Participant } = require("../../db/opposed/participant")

const advantagePicker = require("./advantage-picker")

describe("participant advantage selector", () => {
  describe("data", () => {
    it("customId includes participant id", () => {
      const selector = advantagePicker.data("en-US", { id: "atk" })

      expect(selector.data.custom_id).toMatch("atk")
    })

    it("has a descriptive placeholder", () => {
      const selector = advantagePicker.data("en-US", { id: "atk" })

      expect(selector.data.placeholder).toMatch("Select your advantages")
    })

    it.concurrent.each([["bomb"], ["ties"], ["cancels"]])("includes the %s option", (advantage) => {
      const selector = advantagePicker.data("en-US", { id: "atk" })

      const option_names = selector.options.map((o) => o.data.value)
      expect(option_names).toContain(advantage)
    })

    it("allows zero values", () => {
      const selector = advantagePicker.data("en-US", { id: "atk" })

      expect(selector.data.min_values).toEqual(0)
    })

    it("allows three values", () => {
      const selector = advantagePicker.data("en-US", { id: "atk" })

      expect(selector.data.max_values).toEqual(3)
    })
  })

  describe("execute", () => {
    let interaction
    let challenge
    let participant

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture(Challenge.States.Tying).attachMessage(interaction.message.id)
      participant = challenge.addAttacker()
      interaction.user.id = participant.uid

      const selector = advantagePicker.data("en-US", participant)
      interaction.customId = selector.data.custom_id
    })

    describe("authorization", () => {
      it("allows user with matching id", async () => {
        await expect(advantagePicker.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows all others", async () => {
        interaction.user.id = "other"

        await expect(advantagePicker.execute(interaction)).rejects.toThrow()
      })
    })

    describe("with no selection", () => {
      beforeEach(() => {
        participant.setAdvantages([Participant.Advantages.Ties])
      })

      it("sets advantages to ['none']", async () => {
        await advantagePicker.execute(interaction)

        expect(participant.record.advantages).toEqual([Participant.Advantages.None])
      })
    })

    describe("with selected advantages", () => {
      beforeEach(() => {
        participant.setAdvantages([Participant.Advantages.Ties])
        interaction.values = [Participant.Advantages.Bomb]
      })

      it("saves advantages", async () => {
        await advantagePicker.execute(interaction)

        expect(participant.record.advantages).toEqual([Participant.Advantages.Bomb])
      })
    })
  })
})
