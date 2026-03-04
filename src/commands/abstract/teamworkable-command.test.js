import { Interaction } from "../../../testing/interaction.js"

import { TeamworkableCommand } from "./teamworkable-command"

class TestCommand extends TeamworkableCommand {
  static name = "roll"
  validation = undefined

  perform() {
    return "test"
  }

  validate() {
    return this.validation
  }
}

describe("Teamwork command base class", () => {
  describe("defaults", () => {
    it("teamworkable is true", () => {
      expect(TestCommand.teamworkable).toBe(true)
    })
  })

  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    describe("with validation error", () => {
      it("responds with the validation message", async () => {
        const cmd = new TestCommand(interaction)
        cmd.validation = "nope"

        const result = await cmd.execute()

        expect(result.components[0].data.content).toMatch("nope")
      })
    })
  })
})
