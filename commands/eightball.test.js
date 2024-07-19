const eightball_command = require("./eightball")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("schema", () => {
  describe("question", () => {
    const question_schema = eightball_command.schema.extract("question")

    it("is required", () => {
      const result = question_schema.validate()

      expect(result.error).toBeTruthy()
    })

    it("caps at 1500 characters", () => {
      const result = question_schema.validate("x".repeat(1501))

      expect(result.error).toBeTruthy()
    })

    it("allows good strings", () => {
      const result = question_schema.validate("x".repeat(100))

      expect(result.error).toBeFalsy()
    })
  })

  describe("doit", () => {
    const doit_schema = eightball_command.schema.extract("doit")

    it("is optional", () => {
      const result = doit_schema.validate()

      expect(result.error).toBeFalsy()
    })

    it("is boolean", () => {
      const result = doit_schema.validate("yes")

      expect(result.error).toBeTruthy()
    })

    it("accepts boolean", () => {
      const result = doit_schema.validate(true)

      expect(result.error).toBeFalsy()
    })
  })
})

describe("perform", () => {
  it("displays the question", async () => {
    const question_text = "this is a test"
    const options = {
      question: question_text
    }

    const result = await eightball_command.perform(options)

    expect(result).toMatch(question_text)
  })
})

describe("execute", () => {
  describe("secret", () => {
    it("when secret is true, reply is ephemeral", async () => {
      interaction.command_options.secret = true

      const result = await eightball_command.execute(interaction)

      expect(result.ephemeral).toBeTruthy()
    })

    it("when secret is false, reply is not ephemeral", async () => {
      interaction.command_options.secret = false

      const result = await eightball_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })

    it("secret defaults to false", async () => {
      const result = await eightball_command.execute(interaction)

      expect(result.ephemeral).toBeFalsy()
    })
  })
})
