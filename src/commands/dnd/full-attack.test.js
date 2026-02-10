import { Interaction } from "../../../testing/interaction.js"

import { FullAttack } from "./full-attack.js"

describe("/dnd full-attack", () => {
  describe("schema", () => {
    describe("swings", () => {
      const swings_schema = FullAttack.schema.extract("swings")

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
      const crit_schema = FullAttack.schema.extract("crit")

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
      const ac_schema = FullAttack.schema.extract("ac")

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
      const cmd = new FullAttack(interaction)

      const result = cmd.perform()

      expect(result).toMatch("1d20")
    })

    it("rolls multiple results", () => {
      interaction.command_options = {
        rolls: 2
      }
      const cmd = new FullAttack(interaction)

      const result = cmd.perform()

      expect(result).toMatch("2 full attacks")
    })
  })
})
