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

  it("excludes subcommands", () => {
    const global_commands = commands.global()

    expect(global_commands.has("roll-help topic")).toBeFalsy()
  })
})

describe("guild collection", () => {
  it("only includes guild commands", () => {
    const guild_commands = commands.guild()

    expect(guild_commands.has("roll-help")).toBeFalsy()
    expect(guild_commands.has("fate")).toBeTruthy()
  })

  it("excludes subcommands", () => {
    const guild_commands = commands.guild()

    expect(guild_commands.has("table add")).toBeFalsy()
  })
})

describe("all_choices", () => {
  it("includes top-level names", () => {
    const names = commands.all_choices.map((c) => c.name)
    expect(names).toContain("coin")
  })

  it("includes subcommand names", () => {
    const names = commands.all_choices.map((c) => c.name)
    expect(names).toContain("roll-help command")
  })
})

function pretty(command) {
  let presented = ""
  if (command.parent) presented += command.parent + " "
  presented += command.name
  return presented
}

const command_objects = Array.from(commands.values())
describe.each(command_objects)("minimal correctness", (command) => {
  describe(`${pretty(command)} data`, () => {
    it("returns data", () => {
      const result = command.data()

      expect(result).toBeTruthy()
    })

    it("uses the command's name", () => {
      const result = command.data()

      expect(result.name).toEqual(command.name)
    })
  })
  describe(`${pretty(command)} help`, () => {
    it("returns a string", () => {
      const result = command.help({ command_name: command.name })

      expect(typeof result).toEqual("string")
    })
  })
})
