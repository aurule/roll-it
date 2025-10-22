jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")

const goButton = require("./go-button")

describe("go throw button", () => {
  describe("data", () => {
    it("has the go throw label", () => {
      const result = goButton.data("en-US")

      expect(result.data.label).toMatch("Throw")
    })
  })

  describe("chooseLeader", () => {
    let challenge
    let rps_test
    let participants

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Throwing).withParticipants()
      challenge.attacker.winsTies()
      rps_test = challenge.addTest()
      rps_test.attackerChop("rock")
      rps_test.defenderChop("rock")
      participants = [challenge.attacker.record, challenge.defender.record]
    })

    it("with a tied result, returns challenge winner", () => {
      const chops = [rps_test.attacker_chop.record, rps_test.defender_chop.record]

      const result = goButton.chooseLeader(chops, participants, challenge.id)

      expect(result.id).toBe(challenge.attacker.id)
    })

    it("when attacker chop wins, returns attacker", () => {
      rps_test.attacker_chop.resolve("paper")
      rps_test.defender_chop.resolve("rock")
      const chops = [rps_test.attacker_chop.record, rps_test.defender_chop.record]

      const result = goButton.chooseLeader(chops, participants, challenge.id)

      expect(result.id).toBe(challenge.attacker.id)
    })

    it("when defender chop wins, returns defender", () => {
      rps_test.attacker_chop.resolve("rock")
      rps_test.defender_chop.resolve("paper")
      const chops = [rps_test.attacker_chop.record, rps_test.defender_chop.record]

      const result = goButton.chooseLeader(chops, participants, challenge.id)

      expect(result.id).toBe(challenge.defender.id)
    })
  })

  describe("resolveChops", () => {
    let interaction
    let challenge
    let rps_test
    let participants

    beforeEach(() => {
      interaction = new Interaction()
      interaction.deferUpdate()
      challenge = new ChallengeFixture(Challenge.States.Throwing).withParticipants()
      rps_test = challenge.addTest()
      participants = [challenge.attacker.record, challenge.defender.record]
    })

    describe("with a winner", () => {
      let chops

      beforeEach(() => {
        rps_test.attackerChop("rock")
        rps_test.defenderChop("paper")
        chops = [rps_test.attacker_chop.record, rps_test.defender_chop.record]
      })

      it("saves the chop results", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(rps_test.attacker_chop.record.result).toMatch("rock")
        expect(rps_test.defender_chop.record.result).toMatch("paper")
      })

      it("edits the message to show chop results", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(interaction.replyContent).toMatch(
          "<@def> leads (:scroll: paper *vs* <@atk>'s :rock: rock)",
        )
      })

      it("saves test leader", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(rps_test.record.leader_id).toBe(challenge.defender.id)
      })

      it("saves test breakdown", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(rps_test.record.breakdown).toMatch(":scroll: paper *vs* <@atk>'s :rock: rock")
      })

      it("saves test breakdown", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(rps_test.record.history).toMatch("1. <@def> leads")
      })

      it("sets challenge state to bidding-attacker", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(challenge.record.state).toEqual(Challenge.States.Winning)
      })

      it("replies with winning message", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(interaction.replyContent).toMatch("is currently winning")
      })
    })

    describe("with a tie", () => {
      let chops

      beforeEach(() => {
        rps_test.attackerChop("rock")
        rps_test.defenderChop("rock")
        chops = [rps_test.attacker_chop.record, rps_test.defender_chop.record]
      })

      it("saves the chop results", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(rps_test.attacker_chop.record.result).toMatch("rock")
        expect(rps_test.defender_chop.record.result).toMatch("rock")
      })

      it("edits the message to show chop results", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(interaction.replyContent).toMatch("Tied (:rock: rock *vs* :rock: rock)")
      })

      it("sets challenge state to bidding-attacker", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(challenge.record.state).toEqual(Challenge.States.BiddingAttacker)
      })

      it("replies with bidding-attack message", async () => {
        await goButton.resolveChops({
          interaction,
          chops,
          participants,
          test: rps_test.record,
        })

        expect(interaction.replyContent).toMatch("you are currently tied")
      })
    })
  })

  describe("execute", () => {
    let interaction
    let challenge
    let rps_test

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture(Challenge.States.Throwing).withParticipants()
      rps_test = challenge.addTest().attachMessage(interaction.message.id)
      interaction.user.id = challenge.defender_uid
    })

    describe("authorization", () => {
      it("allows attacker", async () => {
        interaction.user.id = challenge.attacker_uid

        await expect(goButton.execute(interaction)).resolves.not.toThrow()
      })

      it("allows defender", async () => {
        interaction.user.id = challenge.defender_uid

        await expect(goButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows other users", async () => {
        interaction.user.id = "asdf"

        await expect(goButton.execute(interaction)).rejects.toThrow("is not allowed")
      })
    })

    it("shows error on click with no selection", async () => {
      await goButton.execute(interaction)

      expect(interaction.replyContent).toMatch("have to pick a symbol")
    })

    describe("with chop selection", () => {
      beforeEach(() => {
        rps_test.defenderChop("paper")
      })

      it("sets user's chop to ready", async () => {
        await goButton.execute(interaction)

        expect(rps_test.defender_chop.record.ready).toBe(true)
      })

      it("adds 🛡️ emoji for the defender", async () => {
        await goButton.execute(interaction)

        expect(interaction.message.reactions).toContain("🛡️")
      })

      it("adds 🗡️ emoji for the attacker", async () => {
        interaction.user.id = challenge.attacker_uid
        rps_test.attackerChop("rock")

        await goButton.execute(interaction)

        expect(interaction.message.reactions).toContain("🗡️")
      })

      it("with one chop ready, does not resolve symbols", async () => {
        await goButton.execute(interaction)

        expect(rps_test.defender_chop.record.result).toBeNull()
      })

      it("with both chops ready, resolves symbols", async () => {
        rps_test.attackerChop("rock").ready()

        await goButton.execute(interaction)

        expect(rps_test.defender_chop.record.result).not.toBeNull()
      })
    })
  })
})
