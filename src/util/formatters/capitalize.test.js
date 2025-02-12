const { capitalize } = require("./capitalize")

describe("capitalize", () => {
  it("changes first character", () => {
    const result = capitalize("test")

    expect(result).toEqual("Test")
  })
})
