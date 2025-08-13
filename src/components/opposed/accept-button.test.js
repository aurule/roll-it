jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")

const acceptButton = require("./accept-button")

describe("opposed tie accept button", () => {
  describe("data", () => {
    it("has the accept tie label", () => {
      const result = acceptButton.data("en-US")

      expect(result.data.label).toMatch("Accept")
    })
  })

  describe("execute", () => {
    let interaction
    let challenge
    let tied_test

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture(Challenge.States.Tying).withParticipants().attachMessage(interaction.message.id)
      tied_test = challenge.addTie()
      tied_test.attackerChop("rock")
      tied_test.defenderChop("rock")
    })

    describe("authorization", () => {
      it("allows attacker", async () => {
        interaction.user.id = challenge.attacker_uid

        await expect(acceptButton.execute(interaction)).resolves.not.toThrow()
      })

      it("allows defender", async () => {
        interaction.user.id = challenge.defender_uid

        await expect(acceptButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows other users", async () => {
        await expect(acceptButton.execute(interaction)).rejects.toThrow("is not allowed")
      })
    })

    describe("reactions", () => {
      it("reacts with 🗡️ for attacker", async () => {
        interaction.user.id = challenge.attacker_uid

        await acceptButton.execute(interaction)

        expect(interaction.message.reactions).toContain("🗡️")
      })

      it("reacts with 🛡️ for defender", async () => {
        interaction.user.id = challenge.defender_uid

        await acceptButton.execute(interaction)

        expect(interaction.message.reactions).toContain("🛡️")
      })
    })

    describe("after both click", () => {
      beforeEach(() => {
        tied_test.attacker_chop.accept()
      })

      it("edits to show inert tying message", async () => {
        interaction.user.id = challenge.defender_uid

        await acceptButton.execute(interaction)

        expect(interaction.replyContent).toMatch("challenge is tied")
      })

      it("sets challenge state to Accepted", async () => {
        interaction.user.id = challenge.defender_uid

        await acceptButton.execute(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.Accepted)
      })

      it("replies with accepted tie final result message", async () => {
        interaction.user.id = challenge.defender_uid

        await acceptButton.execute(interaction)

        expect(interaction.replyContent).toMatch("ended in a tie")
      })
    })
  })
})
