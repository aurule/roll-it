const { operator, signed } = require("./signed")

describe("operator", () => {
  it("renders positive addition", () => {
    const result = operator(5)

    expect(result).toEqual(" + 5")
  })

  it("renders negative addition", () => {
    const result = operator(-5)

    expect(result).toEqual(" - 5")
  })

  it("ignores zero", () => {
    const result = operator(0)

    expect(result).toEqual("")
  })
})

describe("signed", () => {
  it("signs positive number", () => {
    const result = signed(5)

    expect(result).toEqual("+5")
  })

  it("signs negative number", () => {
    const result = signed(-5)

    expect(result).toEqual("-5")
  })

  it("does not sign zero", () => {
    const result = signed(0)

    expect(result).toEqual("0")
  })
})
