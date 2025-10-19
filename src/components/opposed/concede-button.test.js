jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")

const concedeButton = require("./concede-button")

describe("opposed test concede button", () => {
  describe("data", () => {
    it("has a sensible id", () => {
      const button = concedeButton.data("en-US")

      expect(button.data.custom_id).toMatch("concede")
    })

    it("has a label", () => {
      const button = concedeButton.data("en-US")

      expect(button.data.label).toMatch("Concede")
    })
  })

  describe("execute", () => {
    let interaction
    let challenge

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture().withParticipants().attachMessage(interaction.message.id)
      challenge.addDefenderWin()
      interaction.user.id = challenge.attacker.uid
      interaction.customId = "opposed_concede"
    })

    describe("authorization", () => {
      it("allows attacking user", async () => {
        await expect(concedeButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows all others", async () => {
        interaction.user.id = "other"

        await expect(concedeButton.execute(interaction)).rejects.toThrow()
      })
    })

    it("sets state to conceded", async () => {
      await concedeButton.execute(interaction)

      expect(challenge.record.state).toEqual(Challenge.States.Conceded)
    })

    it("replies with concession message", async () => {
      await concedeButton.execute(interaction)

      expect(interaction.replyContent).toMatch("<@atk> conceded to <@def>")
    })
  })
})
