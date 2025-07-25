const { Opposed } = require("../../db/opposed")
const { Challenge } = require("../../db/opposed/challenge")
const { OpTest } = require("../../db/opposed/optest")
const { Participant } = require("../../db/opposed/participant")

const { makeHistory } = require("./history")

describe("makeHistory", () => {
  let opposed
  let challenge_id
  let attacker_id
  let defender_id
  let test_id
  let opposed_test
  const attacker_uid = "atk"
  const defender_uid = "def"

  beforeEach(() => {
    opposed = new Opposed()
    let result = opposed.addChallenge({
      locale: "en-US",
      description: "testing challenge",
      attacker_uid,
      attribute: "mental",
      retests_allowed: true,
      retest_ability: "occult",
      state: Challenge.States.Tying,
      channel_uid: "testchan",
      timeout: 1000,
    })
    challenge_id = result.lastInsertRowid

    result = opposed.addParticipant({
      challenge_id,
      user_uid: attacker_uid,
      mention: `<@${attacker_uid}>`,
      role: Participant.Roles.Attacker,
      advantages: ["hi", "there"],
    })
    attacker_id = result.lastInsertRowid
    result = opposed.addParticipant({
      challenge_id,
      user_uid: "def",
      mention: `<@${defender_uid}>`,
      role: Participant.Roles.Defender,
      advantages: ["oh", "no"],
    })
    defender_id = result.lastInsertRowid

    result = opposed.addTest({
      challenge_id,
      locale: "en-US",
    })
    test_id = result.lastInsertRowid

    opposed_test = opposed.getTest(test_id)
  })

  it("shows tied with no leader", () => {
    opposed_test.leader_id = null
    opposed_test.breakdown = "same v same"

    const result = makeHistory(opposed_test)

    expect(result).toMatch("Tied")
  })

  it("shows winner with a leader", () => {
    opposed_test.leader_id = attacker_id
    opposed_test.breakdown = "rock v defender's scissors"

    const result = makeHistory(opposed_test)

    expect(result).toMatch("<@atk> leads")
  })

  describe("retest line", () => {
    it("shows retest line if retested", () => {
      opposed_test.leader_id = attacker_id
      opposed_test.breakdown = "rock v defender's scissors"
      opposed_test.retester_id = defender_id
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
      opposed_test.leader_id = attacker_id
      opposed_test.breakdown = "rock v defender's scissors"
      opposed_test.retester_id = defender_id
      opposed_test.retest_reason = reason
      opposed_test.retested = true

      const result = makeHistory(opposed_test)

      expect(result).toMatch(text)
    })
  })

  it("shows cancel line if cancelled", () => {
    opposed_test.leader_id = attacker_id
    opposed_test.breakdown = "rock v defender's scissors"
    opposed_test.retester_id = defender_id
    opposed_test.retest_reason = OpTest.RetestReasons.Merit
    opposed_test.canceller_id = attacker_id
    opposed_test.cancelled_with = OpTest.CancelReasons.Ability
    opposed_test.cancelled = true

    const result = makeHistory(opposed_test)

    expect(result).toMatch('<@atk> cancelled with "ability"')
  })
})
