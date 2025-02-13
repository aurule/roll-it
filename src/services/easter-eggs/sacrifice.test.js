const sacrifice = require("./sacrifice")

describe("hasTrigger", () => {
  it("returns true when one trigger appears", () => {
    const message = "a sacrifice"

    const result = sacrifice.hasTrigger(message)

    expect(result).toEqual(true)
  })

  it("returns true when multiple triggers appears", () => {
    const message = "a sacrifice for sacrificing"

    const result = sacrifice.hasTrigger(message)

    expect(result).toEqual(true)
  })

  it("returns false with no triggers", () => {
    const message = "something else"

    const result = sacrifice.hasTrigger(message)

    expect(result).toEqual(false)
  })
})
