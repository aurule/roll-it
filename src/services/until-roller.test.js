import { roll } from "../services/base-roller.js"
import { sum } from "../services/tally.js"

import { rollUntil } from "./until-roller.js"

describe("roll-until helpers", () => {
  describe("rollUntil", () => {
    it("rolls until target is met", () => {
      const args = {
        target: 20,
        max: 0,
        roll: () => roll(4, 6),
        tally: (res) => sum(res),
      }
      const result = rollUntil(args)
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
      const result = rollUntil(args)

      expect(result.raw_results.length).toBeLessThan(4)
    })
  })
})
