import { Interaction } from "../../../testing/interaction.js"
import { test_secret_option } from "../../../testing/shared/execute-secret.js"

const dnd_skill_command = require("./skill")

describe("/dnd skill", () => {
  describe("schema", () => {
    describe("dc", () => {
      const dc_schema = dnd_skill_command.schema.extract("dc")

      it("is optional", () => {
        const result = dc_schema.validate(undefined, {
          abortEarly: false,
        })

        expect(result.error).toBeFalsy()
      })

      it("allows integers", () => {
        const result = dc_schema.validate(18)

        expect(result.error).toBeFalsy()
      })

      it("disallows floats", () => {
        const result = dc_schema.validate(17.5)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const result = dc_schema.validate(0)

        expect(result.error).toBeTruthy()
      })
    })
  })

  describe("perform", () => {
    it("rolls a single result", () => {
      const result = dnd_skill_command.perform({})

      expect(result).toMatch("rolled")
    })

    it("rolls multiple results", () => {
      const result = dnd_skill_command.perform({
        rolls: 2,
      })

      expect(result).toMatch("2 times")
    })

    it("shows description if present", () => {
      const result = dnd_skill_command.perform({
        description: "a test",
      })

      expect(result).toMatch("a test")
    })
  })

  describe("execute", () => {
    var interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.command_options.subcommand_name = "skill"
    })

    test_secret_option(dnd_skill_command)
  })
})
