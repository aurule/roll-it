const { inline } = require("./inline-list")

describe("inline", () => {
  const test_array = ["first", "second", "third"]

  it("separates first few with a comma", () => {
    const result = inline(test_array)

    expect(result).toMatch("first, second")
  })

  it("uses 'and' to attach final entry", () => {
    const result = inline(test_array)

    expect(result).toMatch("and third")
  })

  it("adds an oxford comma", () => {
    const result = inline(test_array)

    expect(result).toMatch(", and")
  })
})
