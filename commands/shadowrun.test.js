const shadowrun_command = require("./shadowrun")

const { test_secret_option } = require("../testing/shared/execute-secret")

describe("schema", () => {
  describe("edge", () => {
    const edge_schema = shadowrun_command.schema.extract("edge")

    it("is optional", () => {
      const result = edge_schema.validate()

      expect(result.error).toBeFalsy()
    })

    it("is a bool", () => {
      const result = edge_schema.validate("yes")

      expect(result.error).toBeTruthy()
    })

    it("accepts expected values", () => {
      const result = edge_schema.validate(true)

      expect(result.error).toBeFalsy()
    })
  })
})

describe("perform", () => {
  describe("with one roll", () => {
    it.todo("displays the description if present")
    it.todo("displays the result")
  })

  describe("with multiple rolls", () => {
    it.todo("displays the description if present")
    it.todo("displays the result")
  })

  describe("with until", () => {
    it.todo("displays the description if present")
    it.todo("displays the result")
  })
})

test_secret_option(shadowrun_command)
