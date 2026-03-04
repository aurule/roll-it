import { Interaction } from "../../../testing/interaction.js"

import { Save } from "./save.js"

describe("/dnd save", () => {
  describe("schema", () => {
    describe("dc", () => {
      const dc_schema = Save.schema.extract("dc")

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
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("rolls a single result", () => {
      interaction.command_options = {
        rolls: 1,
      }
      const cmd = new Save(interaction)

      const result = cmd.perform()

      expect(result).toMatch("1d20")
    })

    it("rolls multiple results", () => {
      interaction.command_options = {
        rolls: 2,
      }
      const cmd = new Save(interaction)

      const result = cmd.perform()

      expect(result).toMatch("2 times")
    })
  })
})
