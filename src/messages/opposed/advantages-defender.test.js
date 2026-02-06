vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"
const advantages_defender = require("./advantages-defender")

describe("opposed defender advantages message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.AdvantagesDefender).withParticipants()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("messageData", () => {
    it("shows the initial summary", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result.content).toMatch("<@def>, you are being attacked")
    })

    it("includes the description if given", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result.content).toMatch("fake challenge")
    })

    it("shows the attribute", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result.content).toMatch("Mental")
    })

    it("shows the named retest", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result.content).toMatch("occult")
    })

    it("shows the conditions", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result.content).toMatch("not a special attack")
    })

    it("shows the attacker's advantages", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result.content).toMatch("<@atk> has no special advantages")
    })

    it("gives the option to relent", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result).toHaveComponent("opposed_relent")
    })

    it("shows the advantages picker", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result).toHaveComponent(`opposed_advantage_select_${challenge.defender.id}`)
    })

    it("shows the ready button", () => {
      const result = advantages_defender.messageData(challenge.id)

      expect(result).toHaveComponent(`opposed_ready_${challenge.defender.id}`)
    })
  })

  describe("inert", () => {
    it("shows the summary", () => {
      const result = advantages_defender.inertMessageData(challenge.id)

      expect(result.content).toMatch("<@def> is defending")
    })

    it("has no components", () => {
      const result = advantages_defender.inertMessageData(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
