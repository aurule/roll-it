const { Interaction } = require("../../../testing/interaction")
const { test_secret_option } = require("../../../testing/shared/execute-secret")

const dnd_save_command = require("./save")

describe("/dnd save", () => {
  describe("schema", () => {
    describe("dc", () => {
      const dc_schema = dnd_save_command.schema.extract("dc")

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
      const result = dnd_save_command.perform({})

      expect(result).toMatch("1d20")
    })

    it("rolls multiple results", () => {
      const result = dnd_save_command.perform({
        rolls: 2,
      })

      expect(result).toMatch("2 times")
    })

    it("shows description if present", () => {
      const result = dnd_save_command.perform({
        description: "a test",
      })

      expect(result).toMatch("a test")
    })
  })

  describe("execute", () => {
    var interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.command_options.subcommand_name = "save"
    })

    test_secret_option(dnd_save_command)
  })
})
