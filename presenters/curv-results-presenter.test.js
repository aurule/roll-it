const { CurvPresenter } = require("./curv-results-presenter")

describe("CurvPresenter", () => {
  describe("mode", () => {
    it("returns 'many' with multiple rolls", () => {
      const presenter = new CurvPresenter({
        rolls: 2,
      })

      expect(presenter.mode).toEqual("many")
    })

    it("returns 'one' with one roll", () => {
      const presenter = new CurvPresenter({
        rolls: 1,
      })

      expect(presenter.mode).toEqual("one")
    })
  })

  describe("presentResults", () => {
    describe("in many mode", () => {
      it("shows the description if present", () => {
        const presenter = new CurvPresenter({
          rolls: 2,
          raw: [[[3, 4, 5]], [[2, 4, 6]]],
          sums: [[12], [12]],
          picked: [0, 0],
          description: "a test",
        })

        const result = presenter.presentResults()

        expect(result).toMatch("a test")
      })

      it("shows the number of rolls", () => {
        const presenter = new CurvPresenter({
          rolls: 2,
          raw: [[[3, 4, 5]], [[2, 4, 6]]],
          sums: [[12], [12]],
          picked: [0, 0],
        })

        const result = presenter.presentResults()

        expect(result).toMatch("2 times")
      })

      it("shows advantage if present", () => {
        const presenter = new CurvPresenter({
          rolls: 2,
          raw: [
            [
              [3, 4, 5],
              [1, 2, 3],
            ],
            [
              [2, 4, 6],
              [2, 3, 4],
            ],
          ],
          sums: [
            [12, 6],
            [12, 9],
          ],
          picked: [0, 0],
          keep: "highest",
        })

        const result = presenter.presentResults()

        expect(result).toMatch("advantage")
      })

      it("shows each roll", () => {
        const presenter = new CurvPresenter({
          rolls: 2,
          raw: [[[3, 4, 5]], [[2, 3, 6]]],
          sums: [[12], [11]],
          picked: [0, 0],
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**12**")
        expect(result).toMatch("**11**")
      })
    })

    describe("in one mode", () => {
      it("shows the final result", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[3, 4, 5]]],
          sums: [[12]],
          picked: [0],
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**12**")
      })

      it("shows the description if present", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[3, 4, 5]]],
          sums: [[12]],
          picked: [0],
          description: "a test",
        })

        const result = presenter.presentResults()

        expect(result).toMatch("a test")
      })

      it("shows advantage if present", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [
            [
              [3, 4, 5],
              [1, 2, 3],
            ],
          ],
          sums: [[12]],
          picked: [0],
          keep: "highest",
        })

        const result = presenter.presentResults()

        expect(result).toMatch("advantage")
      })

      it("breaks down the dice", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[3, 4, 5]]],
          sums: [[12]],
          picked: [0],
        })

        const result = presenter.presentResults()

        expect(result).toMatch("3")
      })

      it("shows the modifier", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[3, 4, 5]]],
          sums: [[12]],
          picked: [0],
          modifier: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("1")
      })
    })
  })

  describe("presentedDescription", () => {
    describe("with no description", () => {
      it("is an empty string", () => {
        const presenter = new CurvPresenter({})

        expect(presenter.presentedDescription).toEqual("")
      })
    })

    describe("with a description", () => {
      describe("in 'one' mode", () => {
        it("includes extra word", () => {
          const presenter = new CurvPresenter({
            raw: [[1]],
            description: "test description",
            rolls: 1,
          })

          expect(presenter.presentedDescription).toMatch("for")
        })

        it("wraps the description in quotes", () => {
          const presenter = new CurvPresenter({
            raw: [[1]],
            description: "test description",
            rolls: 1,
          })

          expect(presenter.presentedDescription).toMatch('"test description"')
        })
      })

      it("wraps the description in quotes", () => {
        const presenter = new CurvPresenter({
          raw: [[1], [2]],
          description: "test description",
          rolls: 2,
        })

        expect(presenter.presentedDescription).toMatch('"test description"')
      })
    })
  })

  describe("explainOutcome", () => {
    describe("without a crit", () => {
      it("sums the pool", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[2, 3, 4]]],
          sums: [[9]],
          picked: [0],
        })

        const result = presenter.explainOutcome(0)

        expect(result).toEqual("**9**")
      })

      it("adds the modifier", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[2, 3, 4]]],
          sums: [[9]],
          picked: [0],
          modifier: 1,
        })

        const result = presenter.explainOutcome(0)

        expect(result).toEqual("**10**")
      })
    })

    describe("with a crit", () => {
      it("says it's a crit", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[6, 5, 5]]],
          sums: [[16]],
          picked: [0],
          modifier: 2,
        })

        const result = presenter.explainOutcome(0)

        expect(result).toMatch("a crit")
      })

      it("shows the sum", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[6, 5, 5]]],
          sums: [[16]],
          picked: [0],
          modifier: 2,
        })

        const result = presenter.explainOutcome(0)

        expect(result).toMatch("18")
      })
    })
  })

  describe("explainAdvantage", () => {
    it("returns advantage when keep is highest", () => {
      const presenter = new CurvPresenter({
        keep: "highest",
      })

      const result = presenter.explainAdvantage()

      expect(result).toMatch("with advantage")
    })

    it("returns disadvantage when keep is lowest", () => {
      const presenter = new CurvPresenter({
        keep: "lowest",
      })

      const result = presenter.explainAdvantage()

      expect(result).toMatch("with disadvantage")
    })

    it("returns empty string by default", () => {
      const presenter = new CurvPresenter({})

      const result = presenter.explainAdvantage()

      expect(result).toEqual("")
    })
  })

  describe("explainRoll", () => {
    describe("without keep", () => {
      it("shows all dice in the pool", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[2, 3, 4]]],
          sums: [[9]],
          picked: [0],
        })

        const result = presenter.explainRoll(0)

        expect(result).toMatch("2,3,4")
      })

      it("shows the pool's sum", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [[[2, 3, 4]]],
          sums: [[9]],
          picked: [0],
        })

        const result = presenter.explainRoll(0)

        expect(result).toMatch("9")
      })
    })

    describe("with keep", () => {
      it("strikes the dropped pool", () => {
        const presenter = new CurvPresenter({
          rolls: 1,
          raw: [
            [
              [2, 3, 4],
              [5, 6, 4],
            ],
          ],
          sums: [[9, 15]],
          picked: [1],
          keep: "highest",
        })

        const result = presenter.explainRoll(0)

        expect(result).toMatch("~~9")
      })
    })
  })

  describe("explainModifier", () => {
    it("returns empty string with no modifier", () => {
      const presenter = new CurvPresenter({})

      const result = presenter.explainModifier()

      expect(result).toEqual("")
    })

    it("returns signed modifier", () => {
      const presenter = new CurvPresenter({
        modifier: 3,
      })

      const result = presenter.explainModifier()

      expect(result).toMatch("+ 3")
    })
  })

  describe("presentResultSet", () => {
    it("includes each roll's final sum", () => {
      const presenter = new CurvPresenter({
        rolls: 2,
        raw: [[[1, 2, 3]], [[4, 5, 6]]],
        sums: [[6], [15]],
        picked: [0, 0],
      })

      const result = presenter.presentResultSet()

      expect(result).toMatch("6")
      expect(result).toMatch("15")
    })

    it("includes each roll's dice", () => {
      const presenter = new CurvPresenter({
        rolls: 2,
        raw: [[[1, 2, 3]], [[4, 5, 6]]],
        sums: [[6], [15]],
        picked: [0, 0],
      })

      const result = presenter.presentResultSet()

      expect(result).toMatch("1,2,3")
      expect(result).toMatch("4,5,6")
    })
  })

  describe("explainRolls", () => {
    it("returns description of the number of rolls", () => {
      const presenter = new CurvPresenter({
        rolls: 3,
      })

      const result = presenter.explainRolls()

      expect(result).toMatch("3 times")
    })
  })
})
