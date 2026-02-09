import { findByCommands } from "./system-helpers.js"

describe("system helpers", () => {
  describe("findbyCommands", () => {
    describe("system with one required command", () => {
      it("includes if command is in array", () => {
        const command_names = ["dnd", "d20"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).toContain("dnd5e")
      })

      it("excludes if command is not in array", () => {
        const command_names = ["fate"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).not.toContain("dnd5e")
      })

      it("excludes if only recommended is in array", () => {
        const command_names = ["d10"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).not.toContain("dnd5e")
      })

      it("excludes if only optional is in array", () => {
        const command_names = ["table"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).not.toContain("dnd5e")
      })
    })

    describe("system with multiple required commands", () => {
      it("includes if all commands are in array", () => {
        const command_names = ["ffrpg", "d10", "formula", "d20"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).toContain("ffrpg")
      })

      it("excludes if only some commands are in array", () => {
        const command_names = ["ffrpg", "d10"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).not.toContain("ffrpg")
      })

      it("excludes if no commands are in array", () => {
        const command_names = ["d20"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).not.toContain("ffrpg")
      })

      it("excludes if only recommended is in array", () => {
        const command_names = ["d100"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).not.toContain("ffrpg")
      })

      it("excludes if only optional is in array", () => {
        const command_names = ["table"]

        const result = findByCommands(...command_names)

        const system_names = result.map((r) => r.name)
        expect(system_names).not.toContain("generic")
      })
    })
  })
})
