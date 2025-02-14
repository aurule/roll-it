const hummingbird = require("./hummingbird")

describe("hasTrigger", () => {
  it("returns true when one trigger appears", () => {
    const message = "perception"

    const result = hummingbird.hasTrigger(message)

    expect(result).toEqual(true)
  })

  it("returns true when multiple triggers appears", () => {
    const message = "perceiving for a look"

    const result = hummingbird.hasTrigger(message)

    expect(result).toEqual(true)
  })

  it("returns false with no triggers", () => {
    const message = "something else"

    const result = hummingbird.hasTrigger(message)

    expect(result).toEqual(false)
  })
})

describe("qualified", () => {
  it("returns true with 11 successes", () => {
    const result = hummingbird.qualified(11)

    expect(result).toEqual(true)
  })

  it("returns false with other successes", () => {
    const result = hummingbird.qualified(10)

    expect(result).toEqual(false)
  })
})
