jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const advantages_attacker = require("./advantages-attacker")

describe("opposed attacker advantages message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.AdvantagesAttacker).withParticipants()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("data", () => {
    it("shows the initial summary", () => {
      const result = advantages_attacker.data(challenge.id)

      expect(result.content).toMatch("you are attacking <@def>")
    })

    it("includes the description if given", () => {
      const result = advantages_attacker.data(challenge.id)

      expect(result.content).toMatch("fake challenge")
    })

    it("shows the attribute", () => {
      const result = advantages_attacker.data(challenge.id)

      expect(result.content).toMatch("Mental")
    })

    it("shows the named retest", () => {
      const result = advantages_attacker.data(challenge.id)

      expect(result.content).toMatch("occult")
    })

    it("gives the option to withdraw", () => {
      const result = advantages_attacker.data(challenge.id)

      expect(result).toHaveComponent("opposed_withdraw_challenge")
    })

    it("shows the condition picker", () => {
      const result = advantages_attacker.data(challenge.id)

      expect(result).toHaveComponent("opposed_condition_select")
    })

    it("shows the advantages picker", () => {
      const result = advantages_attacker.data(challenge.id)

      expect(result).toHaveComponent(`opposed_advantage_select_${challenge.attacker_id}`)
    })

    it("shows the ready button", () => {
      const result = advantages_attacker.data(challenge.id)

      expect(result).toHaveComponent(`opposed_ready_${challenge.attacker_id}`)
    })
  })

  describe("inert", () => {
    it("shows the generic summary", () => {
      const result = advantages_attacker.inert(challenge.id)

      expect(result.content).toMatch("<@atk> is attacking <@def>")
    })

    it("shows the description if present", () => {
      const result = advantages_attacker.inert(challenge.id)

      expect(result.content).toMatch("fake challenge")
    })

    it("shows the attribute", () => {
      const result = advantages_attacker.inert(challenge.id)

      expect(result.content).toMatch("Mental")
    })

    it("shows the named retest", () => {
      const result = advantages_attacker.inert(challenge.id)

      expect(result.content).toMatch("occult")
    })

    it("shows the conditions", () => {
      const result = advantages_attacker.inert(challenge.id)

      expect(result.content).toMatch("a normal attack")
    })

    it("shows the attacker's advantages", () => {
      const result = advantages_attacker.inert(challenge.id)

      expect(result.content).toMatch("<@atk> has no special advantages")
    })

    it("has no components", () => {
      const result = advantages_attacker.inert(challenge.id)

      expect(result.components).toEqual([{components: []}])
    })
  })
})
