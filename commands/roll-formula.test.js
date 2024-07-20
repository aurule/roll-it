const roll_formula_command = require("./roll-formula")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

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
})

describe("execute", () => {
  beforeEach(() => {
    interaction.command_options.formula = "1d4 + 8"
  })

  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      await roll_formula_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      await roll_formula_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })

    it("secret defaults to false", async () => {
      await roll_formula_command.execute(interaction)

      expect(interaction.replies[0].ephemeral).toBeFalsy()
    })
  })
})
