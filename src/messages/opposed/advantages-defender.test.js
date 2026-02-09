vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"

import { messageData, inertMessageData } from "./advantages-defender.js"

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
      const result = messageData(challenge.id)

      expect(result.content).toMatch("<@def>, you are being attacked")
    })

    it("includes the description if given", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("fake challenge")
    })

    it("shows the attribute", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("Mental")
    })

    it("shows the named retest", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("occult")
    })

    it("shows the conditions", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("not a special attack")
    })

    it("shows the attacker's advantages", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("<@atk> has no special advantages")
    })

    it("gives the option to relent", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent("opposed_relent")
    })

    it("shows the advantages picker", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent(`opposed_advantage_select_${challenge.defender.id}`)
    })

    it("shows the ready button", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent(`opposed_ready_${challenge.defender.id}`)
    })
  })

  describe("inert", () => {
    it("shows the summary", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("<@def> is defending")
    })

    it("has no components", () => {
      const result = inertMessageData(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
