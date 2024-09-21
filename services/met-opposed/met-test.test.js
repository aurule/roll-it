const Participant = require("./participant")

const Test = require("./met-test")

describe("Test", () => {
  let attacker
  let defender
  let test

  beforeEach(() => {
    attacker = new Participant("attacker")
    defender = new Participant("defender")
    test = new Test(attacker, defender)
  })

  it("saves the attacker", () => {
    expect(test.attacker).toBe(attacker)
  })

  it("saves the defender", () => {
    expect(test.defender).toBe(defender)
  })

  describe("chop", () => {
    it("sets the chop for the given user", () => {
      test.chop(attacker, "rock")

      expect(test.chops.get("attacker").request).toEqual("rock")
    })
  })

  describe("roll", () => {
    it("generates a result for the given user's chop", () => {
      test.chop(attacker, "rock")

      test.roll(attacker)

      expect(test.chops.get("attacker").result).toEqual("rock")
    })
  })

  describe("rollAll", () => {
    it("generates a result for every participant", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "paper")

      test.rollAll()

      expect(test.chops.get("attacker").result).toEqual("rock")
      expect(test.chops.get("defender").result).toEqual("paper")
    })
  })

  describe("present", () => {
    it("shows the leader", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "paper")
      test.rollAll()

      const result = test.present()

      expect(result).toMatch("<@defender> leads")
    })

    it("shows the chop results", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "paper")
      test.rollAll()

      const result = test.present()

      expect(result).toMatch("rock vs :scroll:")
    })

    it("shows ties", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "rock")
      test.rollAll()

      const result = test.present()

      expect(result).toMatch("tied")
    })
  })

  describe("explainLeader", () => {
    it("with no leader, returns tied", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "rock")
      test.rollAll()

      const result = test.explainLeader()

      expect(result).toEqual("tied")
    })

    it("with a leader, mentions them", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "paper")
      test.rollAll()

      const result = test.explainLeader()

      expect(result).toEqual("<@defender> leads")
    })
  })

  describe("explainTies", () => {
    it("with a leader and tied outcome, says they have ties", () => {
      attacker.ties = true
      test.chop(attacker, "rock")
      test.chop(defender, "rock")
      test.rollAll()

      const result = test.explainTies()

      expect(result).toMatch("<@attacker> has ties")
    })

    it("returns empty string by default", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "rock")
      test.rollAll()

      const result = test.explainTies()

      expect(result).toEqual("")
    })
  })

  describe("explainChops", () => {
    it("shows the attacker's chop first", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "paper")
      test.rollAll()

      const result = test.explainChops()

      expect(result).toMatch(":rock: rock vs")
    })

    it("shows the defender's chop second", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "paper")
      test.rollAll()

      const result = test.explainChops()

      expect(result).toMatch("vs :scroll: paper")
    })
  })

  describe("outcome", () => {
    it("returns the raw result comparison from attacker POV", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "paper")
      test.rollAll()

      expect(test.outcome).toEqual("lose")
    })
  })

  describe("leader", () => {
    it("with win, returns attacker", () => {
      test.chop(attacker, "scissors")
      test.chop(defender, "paper")
      test.rollAll()

      expect(test.leader).toEqual(attacker)
    })

    it("with lose, returns defender", () => {
      test.chop(attacker, "rock")
      test.chop(defender, "paper")
      test.rollAll()

      expect(test.leader).toEqual(defender)
    })

    describe("with tie", () => {
      it("when both do not have ties, returns null", () => {
        test.chop(attacker, "paper")
        test.chop(defender, "paper")
        test.rollAll()

        expect(test.leader).toBeNull()
      })

      it("when both have ties, returns null", () => {
        attacker.ties = true
        defender.ties = true
        test.chop(attacker, "paper")
        test.chop(defender, "paper")
        test.rollAll()

        expect(test.leader).toBeNull()
      })

      it("when attacker only has ties, returns attacker", () => {
        attacker.ties = true
        test.chop(attacker, "paper")
        test.chop(defender, "paper")
        test.rollAll()

        expect(test.leader).toEqual(attacker)
      })

      it("when defender only has ties, returns defender", () => {
        defender.ties = true
        test.chop(attacker, "paper")
        test.chop(defender, "paper")
        test.rollAll()

        expect(test.leader).toEqual(defender)
      })
    })
  })
})