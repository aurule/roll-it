const { schemaErrors } = require("./schema-errors")

describe("schema errors extractor", () => {
  describe("with errors", () => {
    it("extracts the error message", () => {
      const fake_validation = {
        error: {
          details: [{ message: "test1" }],
        },
      }

      const result = schemaErrors(fake_validation)

      expect(result).toContain("test1")
    })

    it("includes all errors", () => {
      const fake_validation = {
        error: {
          details: [{ message: "test1" }, { message: "test2" }],
        },
      }

      const result = schemaErrors(fake_validation)

      expect(result).toContain("test1")
      expect(result).toContain("test2")
    })
  })

  describe("with no errors", () => {
    it("returns an empty array", () => {
      const fake_validation = {}

      const result = schemaErrors(fake_validation)

      expect(result).toEqual([])
    })
  })
})
