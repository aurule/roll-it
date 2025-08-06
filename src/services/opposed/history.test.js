const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const { OpTest } = require("../../db/opposed/optest")

const { makeHistory } = require("./history")

describe("makeHistory", () => {
  let opposed_test
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Tying).withParticipants()
    opposed_test = challenge.attackerRetest().record
  })

  afterEach(() => {
    challenge.cleanup()
  })

  it("shows tied with no leader", () => {
    opposed_test.leader_id = null
    opposed_test.breakdown = "same v same"

    const result = makeHistory(opposed_test)

    expect(result).toMatch("Tied")
  })

  it("shows winner with a leader", () => {
    opposed_test.leader_id = challenge.attacker_id
    opposed_test.breakdown = "rock v defender's scissors"

    const result = makeHistory(opposed_test)

    expect(result).toMatch("<@atk> leads")
  })

  describe("retest line", () => {
    it("shows retest line if retested", () => {
      opposed_test.leader_id = challenge.attacker_id
      opposed_test.breakdown = "rock v defender's scissors"
      opposed_test.retester_id = challenge.defender_id
      opposed_test.retest_reason = OpTest.RetestReasons.Merit
      opposed_test.retested = true

      const result = makeHistory(opposed_test)

      expect(result).toMatch("<@def> retested")
    })

    it.each([
      [OpTest.RetestReasons.Named, 'retested with the named ability "occult"'],
      [OpTest.RetestReasons.Ability, "retested with a different ability"],
      [OpTest.RetestReasons.Item, "retested with an item"],
      [OpTest.RetestReasons.Merit, "retested with a merit"],
      [OpTest.RetestReasons.Power, "retested with a power"],
      [OpTest.RetestReasons.Overbid, "retested by overbidding"],
      [OpTest.RetestReasons.Willpower, "retested with willpower"],
      [OpTest.RetestReasons.Background, "retested with a background"],
      [OpTest.RetestReasons.Pve, "used a PvE retest"],
      [OpTest.RetestReasons.Automatic, "used an automatic retest"],
      [OpTest.RetestReasons.Forced, "forced a retest"],
      [OpTest.RetestReasons.Other, "retested with something unusual"],
    ])("shows retest line for reason '%s'", (reason, text) => {
      opposed_test.leader_id = challenge.attacker_id
      opposed_test.breakdown = "rock v defender's scissors"
      opposed_test.retester_id = challenge.defender_id
      opposed_test.retest_reason = reason
      opposed_test.retested = true

      const result = makeHistory(opposed_test)

      expect(result).toMatch(text)
    })
  })

  it("shows cancel line if cancelled", () => {
    opposed_test.leader_id = challenge.attacker_id
    opposed_test.breakdown = "rock v defender's scissors"
    opposed_test.retester_id = challenge.defender_id
    opposed_test.retest_reason = OpTest.RetestReasons.Merit
    opposed_test.canceller_id = challenge.attacker_id
    opposed_test.cancelled_with = OpTest.CancelReasons.Ability
    opposed_test.cancelled = true

    const result = makeHistory(opposed_test)

    expect(result).toMatch('<@atk> cancelled with "ability"')
  })
})
