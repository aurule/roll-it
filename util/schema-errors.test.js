const { schemaErrors } = require("./schema-errors")

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
