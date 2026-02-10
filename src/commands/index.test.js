import "./help.js"
import "./fate.js"
import "./chop.js"
import "./coin.js"

import { commands, globals, guild, savable, all_choices } from "./index.js"

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
      expect(savable.has("fate")).toBeTruthy()
    })
  })

  describe("global collection", () => {
    it("only includes global commands", () => {
      expect(globals.has("help")).toBeTruthy()
      expect(globals.has("fate")).toBeFalsy()
    })

    it("excludes subcommands", () => {
      expect(globals.has("help topic")).toBeFalsy()
    })
  })

  describe("guild collection", () => {
    it("only includes guild commands", () => {
      const guild_commands = guild

      expect(guild_commands.has("help")).toBeFalsy()
      expect(guild_commands.has("fate")).toBeTruthy()
    })

    it("excludes subcommands", () => {
      const guild_commands = guild

      expect(guild_commands.has("table add")).toBeFalsy()
    })
  })

  describe("all_choices", () => {
    it("includes top-level names", () => {
      const names = all_choices.map((c) => c.name)

      expect(names).toContain("coin")
    })

    it("includes subcommand names", () => {
      const names = all_choices.map((c) => c.name)

      expect(names).toContain("help command")
    })
  })
})
