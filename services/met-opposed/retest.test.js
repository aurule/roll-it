const Participant = require("./participant")
const Test = require("./met-test")

const Retest = require("./retest")

describe("Retest", () => {
  let attacker
  let defender
  let retest_target

  beforeEach(() => {
    attacker = new Participant("attacker")
    defender = new Participant("defender")
    retest_target = new Test(attacker, defender)
    retest_target.chop(attacker, "rock")
    retest_target.chop(defender, "paper")
    retest_target.rollAll()
  })

  it("stores the retester", () => {
    const retest = new Retest(attacker, "merit", retest_target)

    expect(retest.retester).toBe(attacker)
  })

  it("stores the retest reason", () => {
    const retest = new Retest(attacker, "merit", retest_target)

    expect(retest.reason).toEqual("merit")
  })

  it("duplicates previous test's attacker", () => {
    const retest = new Retest(attacker, "merit", retest_target)

    expect(retest.attacker).toBe(retest_target.attacker)
  })

  it("duplicates previous test's defender", () => {
    const retest = new Retest(attacker, "merit", retest_target)

    expect(retest.defender).toBe(retest_target.defender)
  })

  it("duplicates previous test's chops", () => {
    const retest = new Retest(attacker, "merit", retest_target)

    expect(retest.chops).not.toBe(retest_target.chops)
    expect(retest.chops).toMatchObject(retest_target.chops)
  })

  describe("cancel", () => {
    it("saves the cancel reason", () => {
      const retest = new Retest(attacker, "merit", retest_target)

      retest.cancel(defender, "ability")

      expect(retest.cancelled_with).toEqual("ability")
    })

    it("saves the cancelling user", () => {
      const retest = new Retest(attacker, "merit", retest_target)

      retest.cancel(defender, "ability")

      expect(retest.canceller).toBe(defender)
    })
  })

  describe("cancelled", () => {
    it("false when no cancel reason", () => {
      const retest = new Retest(attacker, "merit", retest_target)

      expect(retest.cancelled).toBeFalsy()
    })

    it("true with cancel reason", () => {
      const retest = new Retest(attacker, "merit", retest_target)

      retest.cancel(defender, "ability")

      expect(retest.cancelled).toBeTruthy()
    })
  })

  describe("present", () => {
    it("shows the leader", () => {
      const retest = new Retest(attacker, "merit", retest_target)
      retest.chop(attacker, "scissors")
      retest.chop(defender, "paper")
      retest.rollAll()

      const result = retest.present()

      expect(result).toMatch("<@attacker> leads")
    })

    it("shows retest", () => {
      const retest = new Retest(attacker, "merit", retest_target)
      retest.chop(attacker, "scissors")
      retest.chop(defender, "paper")
      retest.rollAll()

      const result = retest.present()

      expect(result).toMatch("<@attacker> retested with merit")
    })

    it("shows cancel", () => {
      const retest = new Retest(attacker, "occult", retest_target)
      retest.cancel(defender, "ability")

      const result = retest.present()

      expect(result).toMatch("<@defender> cancelled with ability")
    })

    it("shows chops", () => {
      const retest = new Retest(attacker, "merit", retest_target)
      retest.chop(attacker, "scissors")
      retest.chop(defender, "paper")
      retest.rollAll()

      const result = retest.present()

      expect(result).toMatch("scissors _vs_ <@defender>'s :scroll: paper")
    })

    it("shows ties", () => {
      const retest = new Retest(attacker, "merit", retest_target)
      retest.chop(attacker, "scissors")
      retest.chop(defender, "scissors")
      retest.rollAll()

      const result = retest.present()

      expect(result).toMatch("tied")
    })
  })

  describe("explainRetest", () => {
    it("not cancelled, shows retest", () => {
      const retest = new Retest(attacker, "merit", retest_target)

      const result = retest.explainRetest()

      expect(result).toMatch("<@attacker> retested with merit")
    })

    it("cancelled by player, shows retest and cancel", () => {
      const retest = new Retest(attacker, "merit", retest_target)
      retest.cancel(defender, "ability")

      const result = retest.explainRetest()

      expect(result).toMatch("<@attacker> retested with merit")
      expect(result).toMatch("<@defender> cancelled with ability")
    })

    it("cancelled by system, shows retest and cancel without canceller", () => {
      const retest = new Retest(attacker, "merit", retest_target)
      retest.cancel(null, "time")

      const result = retest.explainRetest()

      expect(result).toMatch("<@attacker> retested with merit")
      expect(result).toMatch(", cancelled for time")
    })
  })

  describe("explainChops", () => {
    it("when cancelled, returns empty string", () => {
      const retest = new Retest(attacker, "merit", retest_target)
      retest.cancel(defender, "ability")

      const result = retest.explainChops()

      expect(result).toEqual("")
    })
  })

  describe("explainTies", () => {
    it("when cancelled, returns empty string", () => {
      const retest = new Retest(attacker, "merit", retest_target)
      retest.cancel(defender, "ability")

      const result = retest.explainTies()

      expect(result).toEqual("")
    })
  })
})
