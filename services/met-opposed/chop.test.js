const Chop = require("./chop")

describe("Chop", () => {
  it("stores the request", () => {
    const chop = new Chop("rock")

    expect(chop.request).toEqual("rock")
  })

  it("result defaults to undefined", () => {
    const chop = new Chop("rock")

    expect(chop.result).toBeUndefined()
  })

  describe("roll", () => {
    it("returns the result", () => {
      const chop = new Chop("rock")

      const result = chop.roll()

      expect(result).toEqual("rock")
    })

    it("saves the result", () => {
      const chop = new Chop("rock")

      chop.roll()

      expect(chop.result).toEqual("rock")
    })
  })
})
