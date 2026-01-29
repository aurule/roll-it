jest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"
const winning = require("./winning")

describe("opposed winning summary message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Winning)
      .withParticipants()
      .setSummary("test summary")
    challenge.addAttackerWin()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("messageData", () => {
    it("shows the winning message", () => {
      const result = winning.messageData(challenge.id)

      expect(result.content).toMatch("is currently winning")
    })

    it("shows the summary", () => {
      const result = winning.messageData(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("mentions the winner", () => {
      const result = winning.messageData(challenge.id)

      expect(result.content).toMatch("<@atk>")
    })

    it("shows the summary", () => {
      const result = winning.messageData(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("has a concede button", () => {
      const result = winning.messageData(challenge.id)

      expect(result).toHaveComponent("opposed_concede")
    })

    it("has a retest picker", () => {
      const result = winning.messageData(challenge.id)

      expect(result).toHaveComponent("opposed_retest_select")
    })

    it("has an retest button", () => {
      const result = winning.messageData(challenge.id)

      expect(result).toHaveComponent("opposed_retest")
    })
  })

  describe("inert", () => {
    it("shows the headline", () => {
      const result = winning.inertMessageData(challenge.id)

      expect(result.content).toMatch("is currently winning")
    })

    it("shows the summary", () => {
      const result = winning.inertMessageData(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("has no components", () => {
      const result = winning.inertMessageData(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
