vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"

import { inertMessageData, messageData } from "./tying.js"

describe("opposed tying summary message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Tying)
      .withParticipants()
      .setSummary("test summary")
    challenge.addTie()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("messageData", () => {
    it("shows the tying message", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("challenge is tied")
    })

    it("shows the summary", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("has an accept button", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent("opposed_accept")
    })

    it("has a retest picker", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent("opposed_retest_select")
    })

    it("has an retest button", () => {
      const result = messageData(challenge.id)

      expect(result).toHaveComponent("opposed_retest")
    })
  })

  describe("inert", () => {
    it("shows the headline", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("challenge is tied")
    })

    it("shows the summary", () => {
      const result = inertMessageData(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("has no components", () => {
      const result = inertMessageData(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
