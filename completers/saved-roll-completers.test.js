const { Interaction } = require("../testing/interaction")

const saved_roll_completers = require("./saved-roll-completers")

describe("saved_roll", () => {
  it("searches names by lowercase", () => {
    const rolls = [
      { name: "figaro", id: 1 },
      { name: "FIDO", id: 2 },
    ]

    const result = saved_roll_completers.saved_roll("fi", rolls)

    const ids = result.map((r) => r.value)
    expect(ids).toContain("1")
    expect(ids).toContain("2")
  })

  it("caps returned names at 100 characters", () => {
    const rolls = [{ name: "a".repeat(101), id: 1 }]

    const result = saved_roll_completers.saved_roll("a", rolls)

    expect(result[0].name.length).toEqual(100)
  })

  it("sends the id as the value", () => {
    const rolls = [{ name: "very well", id: 5 }]

    const result = saved_roll_completers.saved_roll("v", rolls)

    expect(result[0].value).toEqual("5")
  })

  it("sends up to 25 options", () => {
    const rolls = Array.from({ length: 30 }, (_x, idx) => ({
      name: `test${idx}`,
      id: idx,
    }))

    const result = saved_roll_completers.saved_roll("test", rolls)

    expect(result.length).toEqual(25)
  })
})

describe("change_target", () => {
  it("gets changeables from named roll's command", () => {
    const interaction = new Interaction()
    interaction.command_options.name = "very well"
    const rolls = [{ name: "very well", id: 5, command: "nwod" }]

    const result = saved_roll_completers.change_target("", rolls, interaction.options)

    expect(result[0].value).toEqual("pool")
  })

  it("gets changeables from id roll's command", () => {
    const interaction = new Interaction()
    interaction.command_options.name = "5"
    const rolls = [{ name: "very well", id: 5, command: "nwod" }]

    const result = saved_roll_completers.change_target("", rolls, interaction.options)

    expect(result[0].value).toEqual("pool")
  })

  it("filters the changeables", () => {
    const interaction = new Interaction()
    interaction.command_options.name = "5"
    const rolls = [{ name: "very well", id: 5, command: "wod20" }]

    const result = saved_roll_completers.change_target("di", rolls, interaction.options)

    expect(result[0].value).toEqual("difficulty")
  })
})
