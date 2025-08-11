const eightball_command = require("./8ball")

const { test_secret_option } = require("../../testing/shared/execute-secret")

describe("/8ball command", () => {
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
    it("displays the question", () => {
      const question_text = "this is a test"
      const options = {
        question: question_text,
      }

      const result = eightball_command.perform(options)

      expect(result).toMatch(question_text)
    })
  })

  test_secret_option(eightball_command)
})
