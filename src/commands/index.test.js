const { pretty } = require("../../testing/command-pretty")
const CommandHelpPresenter = require("../presenters/command-help-presenter")

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

describe("savable collection", () => {
  it("includes savable commands", () => {
    expect(commands.savable.has("fate")).toBeTruthy()
  })
})

describe("global collection", () => {
  it("only includes global commands", () => {
    const global_commands = commands.global

    expect(global_commands.has("help")).toBeTruthy()
    expect(global_commands.has("fate")).toBeFalsy()
  })

  it("excludes subcommands", () => {
    const global_commands = commands.global

    expect(global_commands.has("help topic")).toBeFalsy()
  })
})

describe("guild collection", () => {
  it("only includes guild commands", () => {
    const guild_commands = commands.guild

    expect(guild_commands.has("help")).toBeFalsy()
    expect(guild_commands.has("fate")).toBeTruthy()
  })

  it("excludes subcommands", () => {
    const guild_commands = commands.guild

    expect(guild_commands.has("table add")).toBeFalsy()
  })
})

describe("deprecated collection", () => {
  it("excludes subcommands", () => {
    const deprecated_commands = commands.deprecated

    expect(deprecated_commands.has("table add")).toBeFalsy()
  })

  it.skip("includes replaced commands", () => {
    const deprecated_commands = commands.deprecated

    expect(deprecated_commands.has("chop")).toBeTruthy()
  })

  it("excludes non-replaced commands", () => {
    const deprecated_commands = commands.deprecated

    expect(deprecated_commands.has("d100")).toBeFalsy()
  })
})

describe("deployable collection", () => {
  it("only includes guild commands", () => {
    const deployable_commands = commands.deployable

    expect(deployable_commands.has("help")).toBeFalsy()
    expect(deployable_commands.has("fate")).toBeTruthy()
  })

  it("excludes subcommands", () => {
    const deployable_commands = commands.deployable

    expect(deployable_commands.has("table add")).toBeFalsy()
  })

  it.skip("excludes replaced commands", () => {
    const deployable_commands = commands.deployable

    expect(deployable_commands.has("chop")).toBeFalsy()
  })

  it("excludes hidden commands", () => {
    const deployable_commands = commands.deployable

    expect(deployable_commands.has("start-here")).toBeFalsy()
  })
})

describe("all_choices", () => {
  it("includes top-level names", () => {
    const names = commands.all_choices.map((c) => c.name)

    expect(names).toContain("coin")
  })

  it("includes subcommand names", () => {
    const names = commands.all_choices.map((c) => c.name)

    expect(names).toContain("help command")
  })
})

const command_objects = Array.from(commands.values())
describe.each(command_objects)("minimal correctness", (command) => {
  describe(`${pretty(command)}`, () => {
    describe(`replacement`, () => {
      it("is optional, names a valid command", () => {
        const replacement_name = command.replacement

        if (replacement_name) expect(commands.has(replacement_name))
      })
    })

    describe(`data`, () => {
      it("returns data", () => {
        const result = command.data()

        expect(result).toBeTruthy()
      })

      it("uses the command's name", () => {
        const result = command.data()

        expect(result.name).toEqual(command.name)
      })
    })

    describe(`help`, () => {
      it("has nothing undefined", () => {
        const result = CommandHelpPresenter.present(command)

        expect(result).not.toMatch("{{")
      })
    })
  })
})
