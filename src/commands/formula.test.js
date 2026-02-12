import { Interaction } from "../../testing/interaction.js"
import { Formula } from "./formula.js"

describe("/formula command", () => {
  describe("schema", () => {
    describe("formula", () => {
      const formula_schema = Formula.schema.extract("formula")

      it("is required", () => {
        const result = formula_schema.validate()

        expect(result.error).toBeTruthy()
      })

      it("is a string", () => {
        const result = formula_schema.validate(567)

        expect(result.error).toBeTruthy()
      })

      it("mas a min length of 3", () => {
        const result = formula_schema.validate("aa")

        expect(result.error).toBeTruthy()
      })

      it("has a max length of 1500", () => {
        const result = formula_schema.validate("a".repeat(1501))

        expect(result.error).toBeTruthy()
      })

      it("accepts expected values", () => {
        const result = formula_schema.validate("3d6 + 3d6 + 12")

        expect(result.error).toBeFalsy()
      })
    })
  })

  describe("perform", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
    })

    it("displays the description if present", async () => {
      const description_text = "this is a test"
      interaction.command_options = {
        formula: "1d4 + 8",
        description: description_text,
      }
      const formula_command = new Formula(interaction)

      const result = formula_command.perform()

      expect(result).toMatch(description_text)
    })

    it("displays the result", async () => {
      interaction.command_options = {
        formula: "1d4 + 8",
      }
      const formula_command = new Formula(interaction)

      const result = formula_command.perform()

      expect(result).toMatch(/\*\*\d+\*\*/)
    })

    it("allows upper case letter 'D'", async () => {
      interaction.command_options = {
        formula: "1D4 + 8",
      }
      const formula_command = new Formula(interaction)

      const result = formula_command.perform()

      expect(result).toMatch(/\*\*\d+\*\*/)
    })

    it("displays the rest of the formula", async () => {
      interaction.command_options = {
        formula: "1d4 + 8",
      }
      const formula_command = new Formula(interaction)

      const result = formula_command.perform()

      expect(result).toMatch("8")
    })

    it("adds the modifier if present", () => {
      interaction.command_options = {
        formula: "5",
        modifier: 2,
      }
      const formula_command = new Formula(interaction)

      const result = formula_command.perform()

      expect(result).toMatch("7")
    })

    it("subtracts the modifier if present", () => {
      interaction.command_options = {
        formula: "5",
        modifier: -2,
      }
      const formula_command = new Formula(interaction)

      const result = formula_command.perform()

      expect(result).toMatch("3")
    })
  })
})
