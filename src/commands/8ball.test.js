import { Magic8Ball } from "./8ball.js"

import { test_secret_option } from "../../testing/shared/execute-secret.js"
import { Interaction } from "../../testing/interaction.js"

describe("/8ball command", () => {
  describe("schema", () => {
    describe("question", () => {
      const question_schema = Magic8Ball.schema.extract("question")

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
      const doit_schema = Magic8Ball.schema.extract("doit")

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
      const interaction = new Interaction()
      interaction.command_options = {
        question: question_text
      }
      const cmd = new Magic8Ball(interaction)

      const result = cmd.perform(options)

      expect(result).toMatch(question_text)
    })
  })

  test_secret_option(eightball_command)
})
