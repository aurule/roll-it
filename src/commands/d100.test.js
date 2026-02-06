vitest.mock("../util/message-builders")

const d100_command = require("./d100")

import { Interaction } from "../../testing/interaction.js"

describe("/d100 command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("perform", () => {
    it("displays the description if present", () => {
      const options = {
        description: "this is a test",
      }

      const result = d100_command.perform(options)

      expect(result).toMatch("this is a test")
    })
  })

  describe("execute", () => {
    describe("with multiple rolls", () => {
      beforeEach(() => {
        interaction.command_options.rolls = 2
      })

      it("displays the description if present", () => {
        const description_text = "this is a test"
        interaction.command_options.description = description_text

        d100_command.execute(interaction)

        expect(interaction.replyContent).toMatch(description_text)
      })
    })
  })
})
