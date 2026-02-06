jest.mock("../util/message-builders")

const d12_command = require("./d12")

import { Interaction } from "../../testing/interaction.js"

describe("/d12 command", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("perform", () => {
    it("displays the description if present", () => {
      const options = {
        description: "this is a test",
      }

      const result = d12_command.perform(options)

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

        d12_command.execute(interaction)

        expect(interaction.replyContent).toMatch(description_text)
      })
    })
  })
})
