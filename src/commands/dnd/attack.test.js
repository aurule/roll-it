import { Interaction } from "../../../testing/interaction.js"

import { Attack } from "./attack.js"

describe("/dnd attack", () => {
  describe("schema", () => {
    describe("crit", () => {
      const crit_schema = Attack.schema.extract("crit")

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
      const ac_schema = Attack.schema.extract("ac")

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
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("rolls a single result", () => {
      interaction.command_options = {
        rolls: 1
      }
      const cmd = new Attack(interaction)

      const result = cmd.perform()

      expect(result).toMatch("1d20")
    })

    it("rolls multiple results", () => {
      interaction.command_options = {
        rolls: 2
      }
      const cmd = new Attack(interaction)

      const result = cmd.perform()

      expect(result).toMatch("2 attacks")
    })
  })
})
