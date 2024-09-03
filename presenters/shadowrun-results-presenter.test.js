const { ShadowrunPresenter } = require("./shadowrun-results-presenter")

describe("ShadowrunPresenter", () => {
  describe("rolls", () => {
    it("matches the number of results", () => {
      const presenter = new ShadowrunPresenter({ raw: [[1], [2]] })

      expect(presenter.rolls).toEqual(2)
    })
  })

  describe("mode", () => {
    describe("when until option true", () => {
      it("returns 'until' with many rolls", () => {
        const presenter = new ShadowrunPresenter({
          until: 2,
          raw: [[1], [2]],
        })

        expect(presenter.mode).toEqual("until")
      })

      it("returns 'until' with one roll", () => {
        const presenter = new ShadowrunPresenter({
          until: 2,
          raw: [[1]],
        })

        expect(presenter.mode).toEqual("until")
      })
    })

    describe("when until option false", () => {
      it("returns 'many' with multiple rolls", () => {
        const presenter = new ShadowrunPresenter({
          until: 0,
          raw: [[1], [2]],
        })

        expect(presenter.mode).toEqual("many")
      })

      it("returns 'one' with one roll", () => {
        const presenter = new ShadowrunPresenter({
          until: 0,
          raw: [[1]],
        })

        expect(presenter.mode).toEqual("one")
      })
    })
  })

  describe("presentResults", () => {
    describe("in until mode", () => {
      it("shows target successes", () => {
        const options = {
          pool: 3,
          raw: [
            [6, 2, 5],
            [2, 5, 5],
          ],
          summed: [2, 2],
          until: 3,
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("until 3")
      })

      it("shows the pool", () => {
        const options = {
          pool: 3,
          raw: [
            [6, 2, 5],
            [2, 5, 5],
          ],
          summed: [2, 2],
          until: 3,
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("3 dice")
      })

      it("shows a final total", () => {
        const options = {
          pool: 3,
          raw: [
            [6, 2, 5],
            [2, 5, 5],
          ],
          summed: [2, 2],
          until: 3,
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("**4** of 3 in 2")
      })
    })

    describe("in many mode", () => {
      it("shows the number of rolls", () => {
        const options = {
          pool: 3,
          raw: [
            [1, 2, 5],
            [2, 5, 5],
          ],
          summed: [1, 2],
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("2 times")
      })
    })

    describe("in single mode", () => {
      it("shows the roll", () => {
        const options = {
          pool: 3,
          raw: [[1, 2, 5]],
          summed: [1],
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("**1**")
      })
    })
  })

  describe("presentedDescription", () => {
    describe("with no description", () => {
      it("is an empty string", () => {
        const presenter = new ShadowrunPresenter({})

        expect(presenter.presentedDescription).toEqual("")
      })
    })

    describe("with a description", () => {
      describe("in 'one' mode", () => {
        it("includes extra word", () => {
          const presenter = new ShadowrunPresenter({
            raw: [[1]],
            description: "test description",
          })

          expect(presenter.presentedDescription).toMatch("for")
        })

        it("wraps the description in quotes", () => {
          const presenter = new ShadowrunPresenter({
            raw: [[1]],
            description: "test description",
          })

          expect(presenter.presentedDescription).toMatch('"test description"')
        })
      })

      it("wraps the description in quotes", () => {
        const presenter = new ShadowrunPresenter({
          raw: [[1], [2]],
          description: "test description",
        })

        expect(presenter.presentedDescription).toMatch('"test description"')
      })
    })
  })

  describe("explainPool", () => {
    it("shows the pool size", () => {
      const options = {
        pool: 8,
      }
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.explainPool()

      expect(result).toMatch("8")
    })

    it("shows 6-again when present", () => {
      const options = {
        pool: 8,
        edge: true,
      }
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.explainPool()

      expect(result).toMatch("rule of six")
    })
  })

  describe("explainExplode", () => {
    it("has rule of six with edge", () => {
      const options = {
        edge: true,
      }
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.explainExplode()

      expect(result).toMatch("rule of six")
    })

    it("empty without edge", () => {
      const options = {}
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.explainExplode()

      expect(result).toEqual("")
    })
  })

  describe("notateDice", () => {
    const options = {
      raw: [[1, 3, 6]],
    }

    it("highlights successes", () => {
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.notateDice(0)

      expect(result).toMatch("**6**")
    })

    it("highlights ones", () => {
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.notateDice(0)

      expect(result).toMatch("_1_")
    })

    it("includes other dice", () => {
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.notateDice(0)

      expect(result).toMatch("3")
    })
  })

  describe("explainTally", () => {
    describe("with no successes", () => {
      it("shows zero with no glitch", () => {
        const options = {
          raw: [[2, 2, 4]],
          summed: [0],
          pool: 3,
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.explainTally(0)

        expect(result).toMatch("0")
      })

      it("shows critical glitch with enough ones", () => {
        const options = {
          raw: [[1, 1, 4]],
          summed: [0],
          pool: 3,
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.explainTally(0)

        expect(result).toMatch("critical glitch")
      })
    })

    describe("with successes", () => {
      it("shows the successes", () => {
        const options = {
          raw: [[2, 2, 5]],
          summed: [1],
          pool: 3,
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.explainTally(0)

        expect(result).toMatch("**1**")
      })

      it("shows glitch when present", () => {
        const options = {
          raw: [[1, 1, 5]],
          summed: [1],
          pool: 3,
        }
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.explainTally(0)

        expect(result).toMatch("glitch")
      })
    })
  })

  describe("glitch", () => {
    it("is true with enough ones", () => {
      const options = {
        pool: 3,
        raw: [[1, 1, 2]],
      }
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.glitch(0)

      expect(result).toBeTruthy()
    })

    it("is false without enough ones", () => {
      const options = {
        pool: 3,
        raw: [[2, 1, 2]],
      }
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.glitch(0)

      expect(result).toBeFalsy()
    })
  })

  describe("presentResultSet", () => {
    const options = {
      raw: [
        [1, 2, 3],
        [1, 2, 5],
      ],
      summed: [0, 1],
      edge: false,
      pool: 3,
    }

    it("shows the tally for each result", () => {
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.presentResultSet()

      expect(result).toMatch("**0**")
      expect(result).toMatch("**1**")
    })

    it("shows the dice for each result", () => {
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.presentResultSet()

      expect(result).toMatch("_1_, 2, 3")
      expect(result).toMatch("_1_, 2, **5**")
    })
  })
})
