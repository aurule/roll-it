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

    expect(result).toMatch("bomb and ties")
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

  it("returns empty string with neither bomb nor ties", () => {
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

    expect(result).toMatch("rock _vs_ :scroll:")
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

    expect(result).toMatch("rock _vs_ :scroll:")
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
  })

  describe("with winner", () => {
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

      expect(result).toMatch("against <@testatk>")
    })

    it("shows description if present", () => {
      default_manager.description = "just a test"

      const result = presenter.resultMessage(default_manager)

      expect(result).toMatch("just a test")
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
    retest.cancel(defender, "item")
  })

  it("says who cancelled", () => {
    const result = presenter.retestCancelMessage(default_manager)

    expect(result).toMatch("<@testdef> cancelled")
  })

  it("gives the cancel reason", () => {
    const result = presenter.retestCancelMessage(default_manager)

    expect(result).toMatch("cancelled with item")
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

describe("retestPrompt", () => {
  let default_manager
  let attacker
  let defender
  let throws

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
    throws = new Collection()
  })

  it("says who started the retest", () => {
    const result = presenter.retestPrompt(default_manager, throws)

    expect(result).toMatch("<@testatk> is retesting")
  })

  it("states retest reason", () => {
    const result = presenter.retestPrompt(default_manager, throws)

    expect(result).toMatch("with a power")
  })

  it("shows retester advantages", () => {
    attacker.bomb = true

    const result = presenter.retestPrompt(default_manager, throws)

    expect(result).toMatch("<@testatk> has bomb")
  })

  it("shows other's advantages", () => {
    defender.bomb = true

    const result = presenter.retestPrompt(default_manager, throws)

    expect(result).toMatch("<@testdef> has bomb")
  })

  describe("with throws", () => {
    it("shows thrown user with check mark", () => {
      throws.set(attacker.id, "scissors")

      const result = presenter.retestPrompt(default_manager, throws)

      expect(result).toMatch(":white_check_mark: <@testatk>")
    })

    it("shows waiting user with empty box", () => {
      throws.set(defender.id, "scissors")

      const result = presenter.retestPrompt(default_manager, throws)

      expect(result).toMatch(":black_large_square: <@testatk>")
    })
  })

  describe("with error", () => {
    it("shows the error message", () => {
      const result = presenter.retestPrompt(default_manager, throws, "just a test")

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
