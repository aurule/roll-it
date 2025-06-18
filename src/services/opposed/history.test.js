const { Opposed, ChallengeStates, ParticipantRoles } = require("../../db/opposed")

const { makeHistory } = require("./history")

describe("makeHistory", () => {
  let opposed
  let challenge_id
  let attacker_id
  let defender_id
  let test_id
  let opposed_test
  let participant_ids
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
      state: ChallengeStates.Tying,
      channel_uid: "testchan",
      timeout: 1000,
    })
    challenge_id = result.lastInsertRowid

    result = opposed.addParticipant({
      challenge_id,
      user_uid: attacker_uid,
      mention: `<@${attacker_uid}>`,
      role: ParticipantRoles.Attacker,
      advantages: ['hi', 'there'],
    })
    attacker_id = result.lastInsertRowid
    result = opposed.addParticipant({
      challenge_id,
      user_uid: "def",
      mention: `<@${defender_uid}>`,
      role: ParticipantRoles.Defender,
      advantages: ['oh', 'no'],
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
      opposed_test.retest_reason = "merit"
      opposed_test.retested = true

      const result = makeHistory(opposed_test)

      expect(result).toMatch("<@def> retested")
    })

    it.each([
      ["named", 'retested with the named ability "occult"'],
      ["ability", "retested with a different ability"],
      ["item", "retested with an item"],
      ["merit", "retested with a merit"],
      ["power", "retested with a power"],
      ["overbid", "retested by overbidding"],
      ["willpower", "retested with willpower"],
      ["background", "retested with a background"],
      ["pve", "used a PvE retest"],
      ["automatic", "used an automatic retest"],
      ["forced", "forced a retest"],
      ["other", "retested with something unusual"],
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
    opposed_test.retest_reason = "merit"
    opposed_test.canceller_id = attacker_id
    opposed_test.cancelled_with = "ability"
    opposed_test.cancelled = true

    const result = makeHistory(opposed_test)

    expect(result).toMatch('<@atk> cancelled with "ability"')
  })
})
