const { present } = require("./table-results-presenter")

describe("table results presenter", () => {
  let opts

  beforeEach(() => {
    opts = {
      userFlake: "testflake",
      rolls: 1,
      tableName: "test table",
      results: ["yeehaw"],
    }
  })

  it("shows the user", () => {
    const result = present(opts)

    expect(result).toMatch(opts.userFlake)
  })

  it("shows the table name", () => {
    const result = present(opts)

    expect(result).toMatch(opts.tableName)
  })

  it("shows roll description if included", () => {
    const description = "some kinda table"

    const result = present({ ...opts, description })

    expect(result).toMatch(description)
  })

  it("single shows the result text", () => {
    const result = present(opts)

    expect(result).toMatch(opts.results[0])
  })

  it("multi shows all result texts", () => {
    const results = ["first result", "second result", "third result"]

    const result = present({ ...opts, results })

    results.map((r) => expect(result).toMatch(r))
  })
})
