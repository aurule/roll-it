vitest.mock("../util/message-builders")

import { Chop } from "./chop.js"

import { Interaction } from "../../testing/interaction.js"

describe("/chop command", () => {
  describe("schema", () => {
    describe("bomb", () => {
      const bomb_schema = Chop.schema.extract("bomb")

      it("is optional", () => {
        const result = bomb_schema.validate(undefined)

        expect(result.error).toBeFalsy()
      })

      it("is boolean", () => {
        const result = bomb_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })
    })

    describe("static_test", () => {
      const static_schema = Chop.schema.extract("static_test")

      it("is optional", () => {
        const result = static_schema.validate()

        expect(result.error).toBeFalsy()
      })

      it("is boolean", () => {
        const result = static_schema.validate("yes")

        expect(result.error).toBeTruthy()
      })
    })
  })

  describe("perform", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("includes the description", () => {
      interaction.command_options = {
        rolls: 1,
        static_test: false,
        bomb: false,
        description: "test desc",
      }
      const chop_command = new Chop(interaction)

      const result = chop_command.perform()

      expect(result).toMatch("test desc")
    })
  })

  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("performs the roll", async () => {
      interaction.command_options.description = "test desc"
      const chop_command = new Chop(interaction)

      await chop_command.execute()

      expect(interaction.replyContent).toMatch("test desc")
    })
  })
})
