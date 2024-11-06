const { Collection } = require("discord.js")

const Participant = require("../services/met-opposed/participant")
const { MetOpposedManager } = require("../services/met-opposed-manager")

const presenter = require("./met-opposed-presenter")

describe("advantages", () => {
  it("calls out bomb and ties", () => {
    const actor = new Participant()
    actor.bomb = true
    actor.ties = true

    const result = presenter.advantages(actor)

    expect(result).toMatch("bomb, ties")
  })

  it("shows bomb alone", () => {
    const actor = new Participant()
    actor.bomb = true

    const result = presenter.advantages(actor)

    expect(result).toMatch("bomb")
    expect(result).not.toMatch("ties")
  })

  it("shows ties alone", () => {
    const actor = new Participant("testman")
    actor.ties = true

    const result = presenter.advantages(actor)

    expect(result).not.toMatch("bomb")
    expect(result).toMatch("ties")
  })

  it("shows cancels", () => {
    const actor = new Participant("testman")
    actor.cancels = true

    const result = presenter.advantages(actor)

    expect(result).toMatch("cancels")
  })

  it("returns empty string with no advantages", () => {
    const actor = new Participant()

    const result = presenter.advantages(actor)

    expect(result).toEqual("")
  })
})

describe("initialMessage", () => {
  let default_manager
  let attacker
  let defender

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    attacker = default_manager.attacker
    defender = default_manager.defender
  })

  it("names the challenger", () => {
    const result = presenter.initialMessage(default_manager)

    expect(result).toMatch("testatk")
  })

  it("names the defender", () => {
    const result = presenter.initialMessage(default_manager)

    expect(result).toMatch("testdef")
  })

  it("shows the attribute for the test", () => {
    const result = presenter.initialMessage(default_manager)

    expect(result).toMatch("Mental")
  })

  it("shows description if present", () => {
    const result = presenter.initialMessage({
      ...default_manager,
      description: "just a test",
    })

    expect(result).toMatch("just a test")
  })

  it("shows attacker advantages", () => {
    attacker.bomb = true

    const result = presenter.initialMessage(default_manager)

    expect(result).toMatch("@testatk> has bomb")
  })

  it("shows deadline", () => {
    const result = presenter.initialMessage(default_manager)

    expect(result).toMatch(/<t:\d+:R>/)
  })

  describe("without retests", () => {
    it("shows warning about no retest options", () => {
      const result = presenter.initialMessage({
        ...default_manager,
        allow_retests: false,
      })

      expect(result).toMatch("without interactive retests")
    })
  })

  describe("with error", () => {
    it("shows the error", () => {
      const result = presenter.initialMessage(default_manager, "an error")

      expect(result).toMatch("an error")
    })
  })
})

describe("initialMessageSummary", () => {
  let default_manager
  let attacker
  let defender

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    attacker = default_manager.attacker
    defender = default_manager.defender
  })

  it("shows attacker", () => {
    const result = presenter.initialMessageSummary(default_manager)

    expect(result).toMatch("testatk")
  })

  it("shows defender", () => {
    const result = presenter.initialMessageSummary(default_manager)

    expect(result).toMatch("testdef")
  })

  it("shows description if present", () => {
    const result = presenter.initialMessageSummary({
      ...default_manager,
      description: "just a test",
    })

    expect(result).toMatch("just a test")
  })

  it("shows attacker advantages", () => {
    attacker.bomb = true

    const result = presenter.initialMessageSummary(default_manager)

    expect(result).toMatch("<@testatk> has bomb")
  })

  it("shows defender advantages", () => {
    defender.bomb = true

    const result = presenter.initialMessageSummary(default_manager)

    expect(result).toMatch("<@testdef> has bomb")
  })
})

describe("relentMessage", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })
  })

  it("says the defender relented", () => {
    const result = presenter.relentMessage(default_manager)

    expect(result).toMatch("<@testdef> relented")
  })
})

describe("cancelMessage", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })
  })

  it("says the attacker cancelled", () => {
    const result = presenter.cancelMessage(default_manager)

    expect(result).toMatch("<@testatk> cancelled")
  })
})

describe("timeoutRelentMessage", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })
  })

  it("says the defender did not respond", () => {
    const result = presenter.timeoutRelentMessage(default_manager)

    expect(result).toMatch("<@testdef> did not respond")
  })
})

describe("statusPrompt", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    const attacker = default_manager.attacker
    const defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()
  })

  it("shows the named retest ability", () => {
    const result = presenter.statusPrompt(default_manager)

    expect(result).toMatch("Occult")
  })

  it("shows the deadline", () => {
    const result = presenter.statusPrompt(default_manager)

    expect(result).toMatch(/<t:\d+:R>/)
  })

  it("shows the chops", () => {
    const result = presenter.statusPrompt(default_manager)

    expect(result).toMatch("paper _vs_ <@testatk>'s :rock:")
  })

  describe("with an error", () => {
    it("shows the error", () => {
      const result = presenter.statusPrompt(default_manager, "just a test")

      expect(result).toMatch("just a test")
    })
  })
})

describe("statusSummary", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    const attacker = default_manager.attacker
    const defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()
  })

  it("shows the named retest ability", () => {
    const result = presenter.statusSummary(default_manager)

    expect(result).toMatch("Occult")
  })

  it("shows the chops", () => {
    const result = presenter.statusSummary(default_manager)

    expect(result).toMatch("paper _vs_ <@testatk>'s :rock:")
  })
})

describe("resultMessage", () => {
  let default_manager
  let attacker
  let defender

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    attacker = default_manager.attacker
    defender = default_manager.defender
  })

  describe("when tied", () => {
    beforeEach(() => {
      const test = default_manager.current_test
      test.chop(attacker, "paper")
      test.chop(defender, "paper")
      test.rollAll()
    })

    it("uses attacker as leader", () => {
      const result = presenter.resultMessage(default_manager)

      expect(result).toMatch(/^<@testatk>/)
    })

    it("shows tied status", () => {
      const result = presenter.resultMessage(default_manager)

      expect(result).toMatch("**tied**")
    })

    it("mentions defender", () => {
      const result = presenter.resultMessage(default_manager)

      expect(result).toMatch("against <@testdef>")
    })

    it("shows description if present", () => {
      default_manager.description = "just a test"

      const result = presenter.resultMessage(default_manager)

      expect(result).toMatch("just a test")
    })

    it("uses possessive message", () => {
      const result = presenter.resultMessage(default_manager)

      expect(result).toMatch(/their \[opposed test\]\(\w+\) against/)
    })
  })

  describe("with a winner", () => {
    describe("when attacker wins", () => {
      beforeEach(() => {
        const test = default_manager.current_test
        test.chop(attacker, "paper")
        test.chop(defender, "rock")
        test.rollAll()
      })

      it("uses possessive message", () => {
        const result = presenter.resultMessage(default_manager)

        expect(result).toMatch(/their \[opposed test\]\(\w+\) against/)
      })
    })

    describe("when defender wins", () => {
      beforeEach(() => {
        const test = default_manager.current_test
        test.chop(attacker, "paper")
        test.chop(defender, "scissors")
        test.rollAll()
      })

      it("shows the leading participant", () => {
        const result = presenter.resultMessage(default_manager)

        expect(result).toMatch(/^<@testdef>/)
      })

      it("shows win status", () => {
        const result = presenter.resultMessage(default_manager)

        expect(result).toMatch("**won**")
      })

      it("mentions loser", () => {
        const result = presenter.resultMessage(default_manager)

        expect(result).toMatch("from <@testatk>")
      })

      it("shows description if present", () => {
        default_manager.description = "just a test"

        const result = presenter.resultMessage(default_manager)

        expect(result).toMatch("just a test")
      })

      it("uses othering message", () => {
        const result = presenter.resultMessage(default_manager)

        expect(result).toMatch(/the \[opposed test\]\(\w+\) from/)
      })
    })
  })
})

describe("timeoutResultMessage", () => {
  let default_manager
  let attacker
  let defender

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    attacker = default_manager.attacker
    defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "paper")
    test.chop(defender, "paper")
    test.rollAll()
  })

  it("explains that time ran out", () => {
    const result = presenter.timeoutResultMessage(default_manager)

    expect(result).toMatch("Time ran out")
  })
})

describe("retestOptions", () => {
  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })
  })

  it("inserts named retest", () => {
    const options = presenter.retestOptions(default_manager)

    const values = options.map((o) => o.value)
    expect(values).toContain("Occult")
  })

  it("shows static options", () => {
    const options = presenter.retestOptions(default_manager)

    const values = options.map((o) => o.value)
    expect(values).toContain("automatic")
  })
})

describe("retestCancelPrompt", () => {
  let default_manager
  let attacker
  let defender

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    attacker = default_manager.attacker
    defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()

    default_manager.test_recorder.addRetest(attacker, "a power")
  })

  it("says who is retesting", () => {
    const result = presenter.retestCancelPrompt(default_manager)

    expect(result).toMatch("<@testatk> is retesting")
  })

  it("includes retest reason", () => {
    const result = presenter.retestCancelPrompt(default_manager)

    expect(result).toMatch("with a power")
  })

  it("call to action for non-retester", () => {
    const result = presenter.retestCancelPrompt(default_manager)

    expect(result).toMatch("you, <@testdef>")
  })

  it("notifies if non-retester has cancels", () => {
    defender.cancels = true

    const result = presenter.retestCancelPrompt(default_manager)

    expect(result).toMatch("prompt for every retest")
  })

  it("shows error message if present", () => {
    const result = presenter.retestCancelPrompt(default_manager, "just a test")

    expect(result).toMatch("just a test")
  })
})

describe("retestCancelMessage", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    const attacker = default_manager.attacker
    const defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()

    const retest = default_manager.test_recorder.addRetest(attacker, "a power")
    retest.cancel(defender, "other")
  })

  it("says who cancelled", () => {
    const result = presenter.retestCancelMessage(default_manager)

    expect(result).toMatch("<@testdef> cancelled")
  })

  it("gives the cancel reason", () => {
    const result = presenter.retestCancelMessage(default_manager)

    expect(result).toMatch("cancelled with other")
  })
})

describe("timeoutCancelRetestMessage", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    const attacker = default_manager.attacker
    const defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()

    const retest = default_manager.test_recorder.addRetest(attacker, "a power")
    retest.cancel(defender, "item")
  })

  it("shows who started the retest", () => {
    const result = presenter.timeoutCancelRetestMessage(default_manager)

    expect(result).toMatch("retest by <@testatk>")
  })

  it("says time expired", () => {
    const result = presenter.timeoutCancelRetestMessage(default_manager)

    expect(result).toMatch("ran out of time")
  })
})

describe("retestWithdrawMessage", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    const attacker = default_manager.attacker
    const defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()

    default_manager.test_recorder.addRetest(attacker, "a power")
  })

  it("shows who started the retest", () => {
    const result = presenter.retestWithdrawMessage(default_manager)

    expect(result).toMatch("<@testatk>")
  })

  it("says they withdrew", () => {
    const result = presenter.retestWithdrawMessage(default_manager)

    expect(result).toMatch("withdrew")
  })
})

describe("retestContinueMessage", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    const attacker = default_manager.attacker
    const defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()

    default_manager.test_recorder.addRetest(attacker, "a power")
  })

  it("says retester did not cancel", () => {
    const result = presenter.retestContinueMessage(default_manager)

    expect(result).toMatch("did not cancel")
  })
})

describe("retestPrompt", () => {
  let default_manager
  let attacker
  let defender
  let responses

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    attacker = default_manager.attacker
    defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()

    default_manager.test_recorder.addRetest(attacker, "a power")
    responses = new Collection()
  })

  it("says who started the retest", () => {
    const result = presenter.retestPrompt(default_manager, responses)

    expect(result).toMatch("<@testatk> is retesting")
  })

  it("states retest reason", () => {
    const result = presenter.retestPrompt(default_manager, responses)

    expect(result).toMatch("with a power")
  })

  it("shows retester advantages", () => {
    attacker.bomb = true

    const result = presenter.retestPrompt(default_manager, responses)

    expect(result).toMatch("<@testatk> has bomb")
  })

  it("shows other's advantages", () => {
    defender.bomb = true

    const result = presenter.retestPrompt(default_manager, responses)

    expect(result).toMatch("<@testdef> has bomb")
  })

  it("shows the timer", () => {
    const result = presenter.retestPrompt(default_manager, responses)

    expect(result).toMatch(/<t:\d+:R>/)
  })

  describe("with responses", () => {
    it("shows thrown user with throw emoji", () => {
      responses.set(attacker.id, "commit")

      const result = presenter.retestPrompt(default_manager, responses)

      expect(result).toMatch(/<:rpsgo:\d+> <@testatk>/)
    })

    it("shows selected user with thought bubble", () => {
      responses.set(attacker.id, "choice")

      const result = presenter.retestPrompt(default_manager, responses)

      expect(result).toMatch(":thought_balloon: <@testatk>")
    })

    it("shows waiting user with empty box", () => {
      const result = presenter.retestPrompt(default_manager, responses)

      expect(result).toMatch(":black_large_square: <@testatk>")
    })
  })

  describe("with error", () => {
    it("shows the error message", () => {
      const result = presenter.retestPrompt(default_manager, responses, "just a test")

      expect(result).toMatch("just a test")
    })
  })
})

describe("retestTimeoutMessage", () => {
  let default_manager

  beforeEach(() => {
    default_manager = new MetOpposedManager({
      attackerId: "testatk",
      defenderId: "testdef",
      attribute: "Mental",
      retest_ability: "Occult",
    })

    const attacker = default_manager.attacker
    const defender = default_manager.defender

    const test = default_manager.current_test
    test.chop(attacker, "rock")
    test.chop(defender, "paper")
    test.rollAll()

    const retest = default_manager.test_recorder.addRetest(attacker, "a power")
  })

  it("says the retest timed out", () => {
    const result = presenter.retestTimeoutMessage(default_manager)

    expect(result).toMatch("retest timed out")
  })
})
