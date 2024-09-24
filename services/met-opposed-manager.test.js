const { Message } = require("../testing/message")

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

  describe("add_message_link", () => {
    it("returns a new link", () => {
      const message = new Message()

      const link = manager.add_message_link(message)

      expect(link).toMatch(/discord.com\/channels\/\d+\/\d+\/\d+/)
    })

    it("stores a new link for a message", () => {
      const message = new Message()

      const link = manager.add_message_link(message)

      expect(link).toEqual(manager.last_message_link)
    })
  })

  describe("last_message_link", () => {
    it("is the most recent message link", () => {
      const message = new Message()

      const link = manager.add_message_link(message)

      expect(manager.last_message_link).toEqual(link)
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
          id: defender.id
        }
      }

      const result = manager.fromDefender(event)

      expect(result).toBeTruthy()
    })

    it("false when event is from different user", () => {
      const event = {
        user: {
          id: attacker.id
        }
      }

      const result = manager.fromDefender(event)

      expect(result).toBeFalsy()
    })
  })

  describe("fromAttacker", () => {
    it("true when the event is from the attacker", () => {
      const event = {
        user: {
          id: attacker.id
        }
      }

      const result = manager.fromAttacker(event)

      expect(result).toBeTruthy()
    })

    it("false when event is from different user", () => {
      const event = {
        user: {
          id: defender.id
        }
      }

      const result = manager.fromAttacker(event)

      expect(result).toBeFalsy()
    })
  })

  describe("fromParticipant", () => {
    it("true when event is from attacker", () => {
      const event = {
        user: {
          id: attacker.id
        }
      }

      const result = manager.fromParticipant(event)

      expect(result).toBeTruthy()
    })

    it("true when event is from defender", () => {
      const event = {
        user: {
          id: defender.id
        }
      }

      const result = manager.fromParticipant(event)

      expect(result).toBeTruthy()
    })

    it("false when event is from different user", () => {
      const event = {
        user: {
          id: "nahbrah"
        }
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
})
