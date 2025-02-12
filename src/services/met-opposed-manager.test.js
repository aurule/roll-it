const { Message } = require("../../testing/message")

const { MetOpposedManager } = require("./met-opposed-manager")

describe("MetOpposedManager", () => {
  let manager
  let attacker
  let defender

  beforeEach(() => {
    manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    attacker = manager.attacker
    defender = manager.defender
  })

  describe("current_test", () => {
    it("is the most recent test", () => {
      const new_test = manager.test_recorder.addTest()

      expect(manager.current_test).toEqual(new_test)
    })
  })

  describe("updateDeadline", () => {
    it("returns a new deadline timestamp in the future", () => {
      const now = new Date().getTime()

      const deadline = manager.updateDeadline()

      expect(deadline.getTime()).toBeGreaterThan(now)
    })

    it("stores the new deadline", () => {
      const deadline = manager.updateDeadline()

      expect(manager.prompt_ends_at).toEqual(deadline)
    })
  })

  describe("allowDone", () => {
    it("returns false for non-participant", () => {
      const result = manager.allowDone("nopealope")

      expect(result).toBeFalsy()
    })

    describe("with no leader", () => {
      beforeEach(() => {
        const test = manager.current_test
        test.chop(attacker, "rock")
        test.chop(defender, "rock")
        test.rollAll()
      })

      it("returns true for attacker", () => {
        const result = manager.allowDone(attacker.id)

        expect(result).toBeTruthy()
      })

      it("returns true for defender", () => {
        const result = manager.allowDone(defender.id)

        expect(result).toBeTruthy()
      })
    })

    describe("with a leader", () => {
      beforeEach(() => {
        const test = manager.current_test
        test.chop(attacker, "rock")
        test.chop(defender, "paper")
        test.rollAll()
      })

      it("returns false for leader", () => {
        const result = manager.allowDone(defender.id)

        expect(result).toBeFalsy()
      })

      it("returns true for non-leader", () => {
        const result = manager.allowDone(attacker.id)

        expect(result).toBeTruthy()
      })
    })
  })

  describe("fromDefender", () => {
    it("true when the event is from the defender", () => {
      const event = {
        user: {
          id: defender.id,
        },
      }

      const result = manager.fromDefender(event)

      expect(result).toBeTruthy()
    })

    it("false when event is from different user", () => {
      const event = {
        user: {
          id: attacker.id,
        },
      }

      const result = manager.fromDefender(event)

      expect(result).toBeFalsy()
    })
  })

  describe("fromAttacker", () => {
    it("true when the event is from the attacker", () => {
      const event = {
        user: {
          id: attacker.id,
        },
      }

      const result = manager.fromAttacker(event)

      expect(result).toBeTruthy()
    })

    it("false when event is from different user", () => {
      const event = {
        user: {
          id: defender.id,
        },
      }

      const result = manager.fromAttacker(event)

      expect(result).toBeFalsy()
    })
  })

  describe("fromParticipant", () => {
    it("true when event is from attacker", () => {
      const event = {
        user: {
          id: attacker.id,
        },
      }

      const result = manager.fromParticipant(event)

      expect(result).toBeTruthy()
    })

    it("true when event is from defender", () => {
      const event = {
        user: {
          id: defender.id,
        },
      }

      const result = manager.fromParticipant(event)

      expect(result).toBeTruthy()
    })

    it("false when event is from different user", () => {
      const event = {
        user: {
          id: "nahbrah",
        },
      }

      const result = manager.fromParticipant(event)

      expect(result).toBeFalsy()
    })
  })

  describe("opposition", () => {
    it("with known user, returns the other participant", () => {
      const result = manager.opposition(attacker.id)

      expect(result).toEqual(defender)
    })
  })

  describe("canCancel", () => {
    it("returns true with cancels", () => {
      const retest = manager.test_recorder.addRetest(attacker, "ability")
      defender.cancels = true

      const result = manager.canCancel(retest)

      expect(result).toBeTruthy()
    })

    it("returns false when canceller has retested with an ability", () => {
      manager.test_recorder.addRetest(attacker, "ability")
      const retest = manager.test_recorder.addRetest(defender, "ability")

      const result = manager.canCancel(retest)

      expect(result).toBeFalsy()
    })

    it("returns false when canceller has retested with the named ability", () => {
      manager.test_recorder.addRetest(attacker, manager.retest_ability)
      const retest = manager.test_recorder.addRetest(defender, "ability")

      const result = manager.canCancel(retest)

      expect(result).toBeFalsy()
    })

    it("returns false when cancelleer has cancelled another retest with an ability", () => {
      const old_retest = manager.test_recorder.addRetest(defender, "ability")
      old_retest.cancel(attacker, "ability")
      const retest = manager.test_recorder.addRetest(defender, "ability")

      const result = manager.canCancel(retest)

      expect(result).toBeFalsy()
    })

    it("returns true when canceller has not retested or cancelled with an ability", () => {
      const old_retest = manager.test_recorder.addRetest(attacker, "item")
      old_retest.cancel(defender, "ability")
      const retest = manager.test_recorder.addRetest(defender, "ability")

      const result = manager.canCancel(retest)

      expect(result).toBeTruthy()
    })

    it("returns false when retest does not use an ability", () => {
      const retest = manager.test_recorder.addRetest(attacker, "item")

      const result = manager.canCancel(retest)

      expect(result).toBeFalsy()
    })
  })
})
