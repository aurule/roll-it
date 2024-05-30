const { checksum } = require("./checksum")

describe("checksum", () => {
  it("makes a unique checksum", () => {
    const result1 = checksum("abcd")
    const result2 = checksum("bcde")

    expect(result1).not.toEqual(result2)
  })
})
