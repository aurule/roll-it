const { DrhPool } = require("./drh-pool")

describe("DrhPool rolled dice class", () => {
  it("saves the name", () => {
    const pool = new DrhPool("test", [[2, 3, 4]])

    expect(pool.name).toEqual("test")
  })

  it("saves the raw dice", () => {
    const pool = new DrhPool("test", [[2, 3, 4]])

    expect(pool.raw).toEqual([[2, 3, 4]])
  })

  it("extracts the first roll", () => {
    const pool = new DrhPool("test", [[2, 3, 4]])

    expect(pool.dice).toEqual([2, 3, 4])
  })

  it("sums successes for 1-3", () => {
    const pool = new DrhPool("test", [[2, 3, 4]])

    expect(pool.summed).toEqual([2])
  })

  it("extracts successes for first roll", () => {
    const pool = new DrhPool("test", [[2, 3, 4]])

    expect(pool.successes).toEqual(2)
  })

  describe("size", () => {
    it("returns number of dice rolled", () => {
      const pool = new DrhPool("test", [[2, 3, 4]])

      expect(pool.size).toEqual(3)
    })
  })

  describe("spread", () => {
    it("gets an array of die result counts", () => {
      const pool = new DrhPool("test", [[2, 3, 4, 4, 5]])

      expect(pool.spread).toEqual([0, 0, 1, 1, 2, 1, 0])
    })
  })

  describe("fromPool", () => {
    it("returns undefined with no dice", () => {
      const result = DrhPool.fromPool("test", 0)

      expect(result).toBeUndefined()
    })

    it("includes pool name", () => {
      const result = DrhPool.fromPool("test", 1)

      expect(result.name).toEqual("test")
    })

    it("includes raw results", () => {
      const result = DrhPool.fromPool("test", 1)

      expect(result.raw.length).toEqual(1)
    })

    it("includes summed results", () => {
      const result = DrhPool.fromPool("test", 1)

      expect(result.summed.length).toEqual(1)
    })
  })
})
