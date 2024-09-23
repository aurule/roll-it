const { throwChoices, throwOptions } = require("./met-throw-options")

describe("throwChoices", () => {
  it("without bomb, omits bomb options", () => {
    const result = throwChoices(false)

    const values = result.map(r => r.value)
    expect(values).not.toContain("bomb")
    expect(values).not.toContain("rand-bomb")
  })

  it("with bomb, includes bomb options", () => {
    const result = throwChoices(true)

    const values = result.map(r => r.value)
    expect(values).toContain("bomb")
    expect(values).toContain("rand-bomb")
  })
})

describe("throwOptions", () => {
  it("without bomb, omits bomb options", () => {
    const result = throwOptions(false)

    const values = result.map(r => r.value)
    expect(values).not.toContain("bomb")
    expect(values).not.toContain("rand-bomb")
  })

  it("with bomb, includes bomb options", () => {
    const result = throwOptions(true)

    const values = result.map(r => r.value)
    expect(values).toContain("bomb")
    expect(values).toContain("rand-bomb")
  })

  it("uses label for name", () => {
    const result = throwOptions()

    expect(result[0]).toMatchObject({label: "⛰️ Rock"})
  })
})
