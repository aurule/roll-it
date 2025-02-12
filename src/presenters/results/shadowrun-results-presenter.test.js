const { ShadowrunPresenter } = require("./shadowrun-results-presenter")

describe("ShadowrunPresenter", () => {
  let options
  describe("presentResults", () => {
    describe("in until mode", () => {
      beforeEach(() => {
        options = {
          pool: 3,
          raw: [
            [6, 2, 5],
            [2, 5, 5],
          ],
          summed: [2, 2],
          until: 3,
          rolls: 1,
        }
      })

      it("shows target successes", () => {
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("until 3")
      })

      it("shows the pool", () => {
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("3 dice")
      })

      it("shows a final total", () => {
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("**4** of 3 in 2")
      })
    })

    describe("in many mode", () => {
      beforeEach(() => {
        options = {
          pool: 3,
          raw: [
            [1, 2, 5],
            [2, 5, 5],
          ],
          summed: [1, 2],
          rolls: 2,
        }
      })

      it("shows the number of rolls", () => {
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("2 times")
      })
    })

    describe("in single mode", () => {
      beforeEach(() => {
        options = {
          pool: 3,
          raw: [[1, 2, 5]],
          summed: [1],
          rolls: 1,
        }
      })
      it("shows the roll", () => {
        const presenter = new ShadowrunPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("**1**")
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

  describe("notateDice", () => {
    const options = {
      raw: [[1, 3, 6]],
      rolls: 1,
    }

    it("highlights successes", () => {
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.notateDice(0)

      expect(result).toMatch("**6**")
    })

    it("highlights ones", () => {
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.notateDice(0)

      expect(result).toMatch("~~1~~")
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
          rolls: 1,
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
          rolls: 1,
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
          rolls: 1,
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
          rolls: 1,
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
        rolls: 1,
      }
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.glitch(0)

      expect(result).toBeTruthy()
    })

    it("is false without enough ones", () => {
      const options = {
        pool: 3,
        raw: [[2, 1, 2]],
        rolls: 1,
      }
      const presenter = new ShadowrunPresenter(options)

      const result = presenter.glitch(0)

      expect(result).toBeFalsy()
    })
  })
})
