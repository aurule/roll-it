const { pickDice, keepFromArray } = require("./pick")

describe("dice pick helper", () => {
  describe("pickDice", () => {
    it("errors on unknown strategy", () => {
      const raw = [[1, 2, 3]]

      expect(() => {
        pickDice(raw, 1, "bloopers")
      }).toThrow('unknown pick strategy "bloopers"')
    })

    it("applies to all results", () => {
      const raw = [
        [1, 2, 3],
        [3, 2, 1],
      ]

      const result = pickDice(raw, 1)

      expect(result.length).toEqual(2)
    })

    describe("'all' strategy", () => {
      it("keeps all dice", () => {
        const raw = [[1, 2, 3]]

        const result = pickDice(raw, 1, "all")

        expect(result[0].results).toEqual(raw[0])
      })
    })

    describe("'highest' strategy", () => {
      it("with dice gte result, keeps all dice", () => {
        const raw = [[1, 2, 3]]

        const result = pickDice(raw, 5, "highest")

        expect(result[0].results).toEqual(raw[0])
      })

      it("highest strategy keeps largest dice", () => {
        const raw = [[1, 2, 3, 4, 5]]

        const result = pickDice(raw, 1, "highest")

        expect(result[0].results).toEqual([5])
      })

      it("includes highest first", () => {
        const raw = [[1, 2, 3, 3, 4]]

        const result = pickDice(raw, 2, "highest")

        expect(result[0].results).toEqual([3, 4])
      })

      it("returns at most dice numbers", () => {
        const raw = [[1, 2, 3, 3, 3]]

        const result = pickDice(raw, 1, "highest")

        expect(result[0].results.length).toEqual(1)
      })
    })

    describe("'lowest' strategy", () => {
      it("lowest strategy keeps smallest dice", () => {
        const raw = [[1, 2, 3, 4, 5]]

        const result = pickDice(raw, 1, "lowest")

        expect(result[0].results).toEqual([1])
      })
    })
  })

  describe("keepFromArray", () => {
    it("errors on unknown strategy", () => {
      const summed = [1, 2, 3]

      expect(() => {
        keepFromArray(summed, 1, "bloopers")
      }).toThrow('unknown pick strategy "bloopers"')
    })

    describe("'all' strategy", () => {
      it("returns all rolls", () => {
        const summed = [1, 2, 3]

        const result = keepFromArray(summed, 1, "all")

        expect(result.results).toEqual(summed)
      })
    })

    describe("'highest' strategy", () => {
      it("with rolls gte summed, returns all rolls", () => {
        const summed = [2]

        const result = keepFromArray(summed, 2, "highest")

        expect(result.results).toEqual(summed)
      })

      it("returns single highest roll", () => {
        const summed = [2, 4]

        const result = keepFromArray(summed, 1, "highest")

        expect(result.results).toEqual([4])
      })

      it("returns index of single highest roll", () => {
        const summed = [2, 4]

        const result = keepFromArray(summed, 1, "highest")

        expect(result.indexes).toEqual([1])
      })

      it("returns multiple highest rolls", () => {
        const summed = [2, 4, 5]

        const result = keepFromArray(summed, 2, "highest")

        expect(result.results).toEqual([4, 5])
      })
    })

    describe("'lowest' strategy", () => {
      it("with rolls gte summed, returns all rolls", () => {
        const summed = [2]

        const result = keepFromArray(summed, 2, "lowest")

        expect(result.results).toEqual(summed)
      })

      it("returns single lowest roll", () => {
        const summed = [2, 4]

        const result = keepFromArray(summed, 1, "lowest")

        expect(result.results).toEqual([2])
      })

      it("returns index of single lowest roll", () => {
        const summed = [2, 4]

        const result = keepFromArray(summed, 1, "lowest")

        expect(result.indexes).toEqual([0])
      })

      it("returns multiple lowest rolls", () => {
        const summed = [2, 4, 5]

        const result = keepFromArray(summed, 2, "lowest")

        expect(result.results).toEqual([2, 4])
      })
    })
  })
})
