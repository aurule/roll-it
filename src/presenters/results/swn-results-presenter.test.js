const swnPresenter = require("./swn-results-presenter")

describe("swn results presenter", () => {
  describe("present", () => {
    describe("with one roll", () => {
      let defaultArgs

      beforeEach(() => {
        defaultArgs = {
          rolls: 1,
          modifier: 0,
          description: "test roll",
          raw: [[1, 4]],
          picked: [{ indexes: [0, 1] }],
          summed: [5],
        }
      })

      it("includes description if present", () => {
        const result = swnPresenter.present(defaultArgs)

        expect(result).toMatch(`"${defaultArgs.description}"`)
      })
    })

    describe("with multiple rolls", () => {
      let defaultArgs

      beforeEach(() => {
        defaultArgs = {
          rolls: 2,
          modifier: 0,
          description: "test roll",
          raw: [
            [1, 4],
            [2, 4],
          ],
          picked: [{ indexes: [0, 1] }, { indexes: [0, 1] }],
          summed: [5, 6],
        }
      })

      it("includes description if present", () => {
        const result = swnPresenter.present(defaultArgs)

        expect(result).toMatch(`"${defaultArgs.description}"`)
      })
    })
  })

  describe("detail", () => {
    describe("with two dice", () => {
      const detailArgs = {
        result: [5, 2],
        indexes: [0, 1],
        summed: 7,
        modifier: 0,
      }

      it("shows the dice", () => {
        const result = swnPresenter.detail(detailArgs)

        expect(result).toMatch("[5, 2]")
      })

      describe("with a non-zero modifier", () => {
        const modArgs = {
          ...detailArgs,
          modifier: 3,
        }

        it("shows the modifier", () => {
          const result = swnPresenter.detail(modArgs)

          expect(result).toMatch("+ 3")
        })
      })
    })

    describe("with more dice", () => {
      const detailArgs = {
        result: [5, 2, 4],
        indexes: [0, 2],
        summed: 9,
        modifier: 0,
      }

      it("shows the dice", () => {
        const result = swnPresenter.detail(detailArgs)

        expect(result).toMatch("[5, ~~2~~, 4]")
      })

      describe("with a non-zero modifier", () => {
        const modArgs = {
          ...detailArgs,
          modifier: 3,
        }

        it("shows the modifier", () => {
          const result = swnPresenter.detail(modArgs)

          expect(result).toMatch("+ 3")
        })
      })
    })
  })
})
