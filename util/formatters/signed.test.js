const { operator } = require("./signed")

describe("operator", () => {
  it("renders positive addition", () => {
    const result = operator(5)

    expect(result).toMatch(" + 5")
  })

  it("renders negative addition", () => {
    const result = operator(-5)

    expect(result).toMatch(" - 5")
  })

  it("ignores zero", () => {
    const result = operator(0)

    expect(result).toMatch("")
  })
})
