import { ContextMenuCommandBuilder } from "discord.js"

import { ContextCommand } from "./context-command"

class TestCommand extends ContextCommand {
  static i18nId = "test"

  execute() {
    return "test"
  }
}

describe("context menu command base class", () => {
  describe("defaults", () => {
    it("type is menu", () => {
      expect(TestCommand.type).toBe("menu")
    })
  })

  describe("builder", () => {
    it("is a context menu command builder", () => {
      expect(TestCommand.builder).toBeInstanceOf(ContextMenuCommandBuilder)
    })
  })
})
