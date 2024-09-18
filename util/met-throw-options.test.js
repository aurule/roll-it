const { throwChoices, randomChoices } = require("./met-throw-options")

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

describe("randomChoices", () => {
  it("without bomb, omits bomb option", () => {
    const result = randomChoices(false)

    const values = result.map(r => r.value)
    expect(values).not.toContain("rand-bomb")
  })

  it("with bomb, includes bomb option", () => {
    const result = randomChoices(true)

    const values = result.map(r => r.value)
    expect(values).toContain("rand-bomb")
  })
})
