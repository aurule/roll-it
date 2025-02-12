const { DrhPool } = require("./drh-pool")

describe("successes", () => {
  it("tallies successes for 1-3", () => {
    const pool = new DrhPool("test", [[2, 3, 4]])

    expect(pool.successes).toEqual(2)
  })
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
