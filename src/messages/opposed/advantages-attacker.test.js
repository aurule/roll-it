vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"

import { messageData, inertMessageData } from "./advantages-attacker.js"

describe("opposed attacker advantages message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.AdvantagesAttacker).withParticipants()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("messageData", () => {
    it("shows the initial summary", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("you are attacking <@def>")
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

    it("gives the option to withdraw", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent("opposed_withdraw_challenge")
    })

    it("shows the condition picker", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent("opposed_condition_select")
    })

    it("shows the advantages picker", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent(`opposed_advantage_select_${challenge.attacker.id}`)
    })

    it("shows the ready button", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent(`opposed_ready_${challenge.attacker.id}`)
    })
  })

  describe("inertMessageData", () => {
    it("shows the generic summary", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("<@atk> is attacking <@def>")
    })

    it("shows the description if present", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("fake challenge")
    })

    it("shows the attribute", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("Mental")
    })

    it("shows the named retest", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("occult")
    })

    it("shows the conditions", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("not a special attack")
    })

    it("shows the attacker's advantages", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("<@atk> has no special advantages")
    })

    it("has no components", () => {
      const result = inertMessageData(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
