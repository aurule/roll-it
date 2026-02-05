import { LocalizedSlashCommandBuilder } from "../../util/localized-command.js"
import { Command } from "./command.js"

class TestCommand extends Command {
  static name = "roll"
}

describe("Command base class", () => {
  describe("defaults", () => {
    it("type is slash", () => {
      expect(TestCommand.type).toEqual("slash")
    })

    it("savable is false", () => {
      expect(TestCommand.savable).toBe(false)
    })

    it("teamworkable is false", () => {
      expect(TestCommand.teamworkable).toBe(false)
    })
  })

  describe("builder", () => {
    it("is a localized slash command builder", () => {
      expect(TestCommand.builder).toBeInstanceOf(LocalizedSlashCommandBuilder)
    })
  })
})
