jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const advantages_defender = require("./advantages-defender")

describe("opposed defender advantages message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.AdvantagesDefender).withParticipants()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("data", () => {
    it("shows the initial summary", () => {
      const result = advantages_defender.data(challenge.id)

      expect(result.content).toMatch("<@atk> is attacking you")
    })

    it("includes the description if given", () => {
      const result = advantages_defender.data(challenge.id)

      expect(result.content).toMatch("fake challenge")
    })

    it("shows the attribute", () => {
      const result = advantages_defender.data(challenge.id)

      expect(result.content).toMatch("Mental")
    })

    it("shows the named retest", () => {
      const result = advantages_defender.data(challenge.id)

      expect(result.content).toMatch("occult")
    })

    it("shows the conditions", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("a normal attack")
    })

    it("shows the attacker's advantages", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("<@atk> has no special advantages")
    })

    it("gives the option to relent", () => {
      const result = advantages_defender.data(challenge.id)

      expect(result).toHaveComponent("opposed_relent")
    })

    it("shows the advantages picker", () => {
      const result = advantages_defender.data(challenge.id)

      expect(result).toHaveComponent(`opposed_advantage_select_${challenge.defender.id}`)
    })

    it("shows the ready button", () => {
      const result = advantages_defender.data(challenge.id)

      expect(result).toHaveComponent(`opposed_ready_${challenge.defender.id}`)
    })
  })

  describe("inert", () => {
    it("shows the generic summary", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("<@atk> is attacking <@def>")
    })

    it("shows the description if present", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("fake challenge")
    })

    it("shows the attribute", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("Mental")
    })

    it("shows the named retest", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("occult")
    })

    it("shows the conditions", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("a normal attack")
    })

    it("shows the attacker's advantages", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("<@atk> has no special advantages")
    })

    it("shows the defender's advantages", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.content).toMatch("<@def> has no special advantages")
    })

    it("has no components", () => {
      const result = advantages_defender.inert(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
