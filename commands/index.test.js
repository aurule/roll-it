const commands = require("./index")

it("loads command files", () => {
  expect(commands.size).toBeGreaterThan(0)
})

it("indexes commands by name", () => {
  expect(commands.get("chop").name).toEqual("chop")
})

it("excludes the index", () => {
  expect(commands.has(undefined)).toBeFalsy()
})

describe("global collection", () => {
  it("only includes global commands", () => {
    const global_commands = commands.global()

    expect(global_commands.has("roll-help")).toBeTruthy()
    expect(global_commands.has("fate")).toBeFalsy()
  })
})

describe("guild collection", () => {
  it("only includes guild commands", () => {
    const guild_commands = commands.guild()

    expect(guild_commands.has("roll-help")).toBeFalsy()
    expect(guild_commands.has("fate")).toBeTruthy()
  })
})

describe("all_choices", () => {
  it("includes top-level names", () => {
    const names = commands.all_choices.map(c => c.name)
    expect(names).toContain("coin")
  })

  it("includes subcommand names", () => {
    const names = commands.all_choices.map(c => c.name)
    expect(names).toContain("roll-help command")
  })
})

describe("surface_choices", () => {
  it("includes top-level names", () => {
    const names = commands.surface_choices.map(c => c.name)
    expect(names).toContain("coin")
  })

  it("does not include subcommand names", () => {
    const names = commands.surface_choices.map(c => c.name)
    expect(names).not.toContain("roll-help command")
  })
})

describe("shared command features", () => {
  // every command should
  // * data() should return something
  // * data()'s name should match the object name property
  // * help should return something
})
