const { extractNumber } = require("./extract-number")

describe("extractNumber", () => {
  it("returns a positive number", () => {
    const result = extractNumber("I got 5 successes")

    expect(result).toEqual(5)
  })

  it("returns multi-digit numbers", () => {
    const result = extractNumber("I got 11 successes")

    expect(result).toEqual(11)
  })

  it("returns a negative number with no spaces", () => {
    const result = extractNumber("I got -5 successes")

    expect(result).toEqual(-5)
  })

  it("returns a negative number with spaces", () => {
    const result = extractNumber("I got - 5 successes")

    expect(result).toEqual(-5)
  })

  it("returns undefined with no number", () => {
    const result = extractNumber("I got zapped")

    expect(result).toBeUndefined()
  })
})
