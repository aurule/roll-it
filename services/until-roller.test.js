const untilService = require("./until-roller")

const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")

describe("rollUntil", () => {
  it("rolls until target is met", () => {
    const args = {
      target: 20,
      max: 0,
      roll: () => roll(4, 6),
      tally: (res) => sum(res),
    }
    const result = untilService.rollUntil(args)
    let finalSum = result.summed_results.reduce((a, b) => a + b, 0)

    expect(finalSum).toBeGreaterThan(19)
  })

  it("stops after max rolls", () => {
    const args = {
      target: 20,
      max: 3,
      roll: () => roll(4, 6),
      tally: (res) => sum(res),
    }
    const result = untilService.rollUntil(args)

    expect(result.raw_results.length).toBeLessThan(4)
  })
})
