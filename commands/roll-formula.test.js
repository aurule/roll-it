const roll_formula_command = require("./roll-formula")

const { Interaction } = require("../testing/interaction")
const { test_secret_option } = require("../testing/shared/execute-secret")

var interaction

describe("schema", () => {
  describe("formula", () => {
    const formula_schema = roll_formula_command.schema.extract("formula")

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
  it("displays the description if present", async () => {
    const description_text = "this is a test"
    const options = {
      formula: "1d4 + 8",
      description: description_text,
    }

    const result = roll_formula_command.perform(options)

    expect(result).toMatch(description_text)
  })

  it("displays the result", async () => {
    const options = {
      formula: "1d4 + 8"
    }

    const result = roll_formula_command.perform(options)

    expect(result).toMatch(/\*\*\d+\*\*/)
  })

  it("displays the rest of the formula", async () => {
    const options = {
      formula: "1d4 + 8"
    }

    const result = roll_formula_command.perform(options)

    expect(result).toMatch("8")
  })

  it("adds the modifier if present", () => {
    const options = {
      formula: "5",
      modifier: 2,
    }

    const result = roll_formula_command.perform(options)

    expect(result).toMatch("7")
  })

  it("subtracts the modifier if present", () => {
    const options = {
      formula: "5",
      modifier: -2,
    }

    const result = roll_formula_command.perform(options)

    expect(result).toMatch("3")
  })
})

test_secret_option(roll_formula_command, {formula: "1d4"})
