jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")

const readyButton = require("./ready-button")

describe("opposed participant ready button", () => {
  describe("data", () => {
    it("includes participant id in customId", () => {
      const button = readyButton.data("en-US", { id: 5 })

      expect(button.data.custom_id).toMatch("5")
    })

    it("has appropriate label", () => {
      const button = readyButton.data("en-US", { id: 5 })

      expect(button.data.label).toMatch("Ready")
    })
  })

  describe("execute", () => {
    let interaction
    let challenge

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture().withParticipants().attachMessage(interaction.message.id)
    })

    describe("for attacker", () => {
      beforeEach(() => {
        interaction.user.id = challenge.attacker.uid
        interaction.customId = readyButton.data("en-US", challenge.attacker).data.custom_id
      })

      describe("authorization", () => {
        it("allows attacking user", async () => {
          await expect(readyButton.execute(interaction)).resolves.not.toThrow()
        })

        it("disallows all others", async () => {
          interaction.user.id = "other"

          await expect(readyButton.execute(interaction)).rejects.toThrow()
        })
      })

      it("edits with advantages_attacker inert", async () => {
        await readyButton.execute(interaction)

        expect(interaction.replyContent).toMatch("<@atk> is attacking <@def>")
      })

      it("sets challenge state to AdvantagesDefender", async () => {
        await readyButton.execute(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.AdvantagesDefender)
      })

      it("shows advantages_defender message", async () => {
        await readyButton.execute(interaction)

        expect(interaction.replyContent).toMatch("<@atk> is attacking you")
      })
    })

    describe("for defender", () => {
      beforeEach(() => {
        interaction.user.id = challenge.defender.uid
        interaction.customId = readyButton.data("en-US", challenge.defender).data.custom_id
        challenge.attacker.setAdvantages(["ties"])
      })

      describe("authorization", () => {
        it("allows defending user", async () => {
          await expect(readyButton.execute(interaction)).resolves.not.toThrow()
        })

        it("disallows all others", async () => {
          interaction.user.id = "other"

          await expect(readyButton.execute(interaction)).rejects.toThrow()
        })
      })

      it("saves the challenge summary", async () => {
        await readyButton.execute(interaction)

        expect(challenge.record.summary).toMatch("<@def> has no special advantages")
      })

      it("sets the tie_winner participant flag", async () => {
        await readyButton.execute(interaction)

        expect(challenge.attacker.record.tie_winner).toBe(true)
      })

      it("sets state to Throwing", async () => {
        await readyButton.execute(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.Throwing)
      })

      it("adds initial test", async () => {
        await readyButton.execute(interaction)

        const first_test = challenge.db.getLatestTest(challenge.id)
        expect(first_test).toBeDefined()
      })

      it("edits to show advantages_defender inert", async () => {
        await readyButton.execute(interaction)

        expect(interaction.replyContent).toMatch(challenge.record.summary)
      })

      it("replies with throwing prompt", async () => {
        await readyButton.execute(interaction)

        expect(interaction.replyContent).toMatch("choose what you will throw")
      })
    })
  })

  describe("tieWinnerId", () => {
    let attacker
    let defender

    describe("attacker has ties, defender does not", () => {
      beforeEach(() => {
        attacker = {
          id: "atk",
          advantages: ["ties"],
        }

        defender = {
          id: "atk",
          advantages: [],
        }
      })

      it("returns attacker id", () => {
        const result = readyButton.tieWinnerId(attacker, defender)

        expect(result).toEqual(attacker.id)
      })
    })

    describe("attacker does not have ties, defender does", () => {
      beforeEach(() => {
        attacker = {
          id: "atk",
          advantages: [],
        }

        defender = {
          id: "atk",
          advantages: ["ties"],
        }
      })

      it("returns defender id", () => {
        const result = readyButton.tieWinnerId(attacker, defender)

        expect(result).toEqual(defender.id)
      })
    })

    describe("attacker has ties, defender has ties", () => {
      beforeEach(() => {
        attacker = {
          id: "atk",
          advantages: ["ties"],
        }

        defender = {
          id: "atk",
          advantages: ["ties"],
        }
      })

      it("returns null", () => {
        const result = readyButton.tieWinnerId(attacker, defender)

        expect(result).toBeNull()
      })
    })

    describe("neither attacker nor defender has ties", () => {
      beforeEach(() => {
        attacker = {
          id: "atk",
          advantages: [],
        }

        defender = {
          id: "atk",
          advantages: [],
        }
      })

      it("returns null", () => {
        const result = readyButton.tieWinnerId(attacker, defender)

        expect(result).toBeNull()
      })
    })
  })
})
