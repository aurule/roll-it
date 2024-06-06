const { pick } = require("./pick")

describe("pick", () => {
  it("errors on unknown strategy", () => {
    const raw = [[1, 2, 3]]

    expect(() => {
      pick(raw, 1, "bloopers")
    }).toThrow('unknown pick strategy "bloopers"')
  })

  it.todo("picks each result")

  describe("per result", () => {
    it("all strategy keeps all dice", () => {
      const raw = [[1, 2, 3]]

      const result = pick(raw, 1, "all")

      expect(result[0].results).toEqual(raw[0])
    })

    it("with dice gte result, keeps all dice", () => {
      const raw = [[1, 2, 3]]

      const result = pick(raw, 5)

      expect(result[0].results).toEqual(raw[0])
    })

    it("highest strategy keeps largest dice", () => {
      const raw = [[1, 2, 3, 4, 5]]

      const result = pick(raw, 1, "highest")

      expect(result[0].results).toEqual([5])
    })

    it("lowest strategy keeps smallest dice", () => {
      const raw = [[1, 2, 3, 4, 5]]

      const result = pick(raw, 1, "lowest")

      expect(result[0].results).toEqual([1])
    })

    it("includes highest first", () => {
      const raw = [[1, 2, 3, 3, 4]]

      const result = pick(raw, 2)

      expect(result[0].results).toEqual([3, 4])
    })

    it("returns at most dice numbers", () => {
      const raw = [[1, 2, 3, 3, 3]]

      const result = pick(raw, 1)

      expect(result[0].results.length).toEqual(1)
    })
  })
})
