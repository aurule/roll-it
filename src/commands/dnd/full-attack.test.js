import { Interaction } from "../../../testing/interaction.js"
import { test_secret_option } from "../../../testing/shared/execute-secret.js"

const dnd_full_attack_command = require("./full-attack")

describe("/dnd full-attack", () => {
  describe("schema", () => {
    describe("swings", () => {
      const swings_schema = dnd_full_attack_command.schema.extract("swings")

      it("is required", () => {
        const result = swings_schema.validate(undefined, {
          abortEarly: false,
        })

        expect(result.error).toBeTruthy()
      })

      it("allows integers", () => {
        const result = swings_schema.validate(3)

        expect(result.error).toBeFalsy()
      })

      it("disallows floats", () => {
        const result = swings_schema.validate(17.5)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const result = swings_schema.validate(0)

        expect(result.error).toBeTruthy()
      })
    })

    describe("crit", () => {
      const crit_schema = dnd_full_attack_command.schema.extract("crit")

      it("is optional", () => {
        const result = crit_schema.validate(undefined, {
          abortEarly: false,
        })

        expect(result.error).toBeFalsy()
      })

      it("allows integers", () => {
        const result = crit_schema.validate(18)

        expect(result.error).toBeFalsy()
      })

      it("disallows floats", () => {
        const result = crit_schema.validate(17.5)

        expect(result.error).toBeTruthy()
      })

      it("allows zero", () => {
        const result = crit_schema.validate(0)

        expect(result.error).toBeFalsy()
      })

      it("has a min of 0", () => {
        const result = crit_schema.validate(-1)

        expect(result.error).toBeTruthy()
      })

      it("has a max of 20", () => {
        const result = crit_schema.validate(21)

        expect(result.error).toBeTruthy()
      })
    })

    describe("ac", () => {
      const ac_schema = dnd_full_attack_command.schema.extract("ac")

      it("is optional", () => {
        const result = ac_schema.validate(undefined, {
          abortEarly: false,
        })

        expect(result.error).toBeFalsy()
      })

      it("allows integers", () => {
        const result = ac_schema.validate(18)

        expect(result.error).toBeFalsy()
      })

      it("disallows floats", () => {
        const result = ac_schema.validate(17.5)

        expect(result.error).toBeTruthy()
      })

      it("has a min of 1", () => {
        const result = ac_schema.validate(0)

        expect(result.error).toBeTruthy()
      })
    })
  })

  describe("perform", () => {
    it("rolls a single result", () => {
      const result = dnd_full_attack_command.perform({})

      expect(result).toMatch("1d20")
    })

    it("rolls multiple results", () => {
      const result = dnd_full_attack_command.perform({
        rolls: 2,
      })

      expect(result).toMatch("2 full attacks")
    })

    it("shows description if present", () => {
      const result = dnd_full_attack_command.perform({
        description: "a test",
      })

      expect(result).toMatch("a test")
    })
  })

  describe("execute", () => {
    var interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.command_options.subcommand_name = "full-attack"
    })

    test_secret_option(dnd_full_attack_command)
  })
})
