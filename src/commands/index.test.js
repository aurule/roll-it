import { commands } from "./index.js"

describe("commands", () => {
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

  describe("sorted collections", () => {
    it("organized by locale", () => {
      expect(commands.sorted.has("en-US")).toBe(true)
    })

    it("is actually sorted", () => {
      const keys = Array.from(commands.sorted.get("en-US").keys())
      const d4_id = keys.indexOf("d4")
      const d100_id = keys.indexOf("d100")

      expect(d100_id).toBeGreaterThan(d4_id)
    })
  })
})
