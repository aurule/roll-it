const { WodPresenter } = require("./wod20-results-presenter")

describe("WodPresenter", () => {
  describe("presentResults", () => {
    describe("in until mode", () => {
      const default_opts = {
        pool: 3,
        raw: [
          [6, 2, 7],
          [2, 9, 10],
        ],
        summed: [2, 2],
        until: 3,
        difficulty: 6,
        rolls: 2,
      }

      it("shows target successes", () => {
        const presenter = new WodPresenter(default_opts)

        const result = presenter.presentResults()

        expect(result).toMatch("until 3")
      })

      it("shows the pool", () => {
        const presenter = new WodPresenter(default_opts)

        const result = presenter.presentResults()

        expect(result).toMatch("3 diff")
      })

      it("shows a final total", () => {
        const presenter = new WodPresenter(default_opts)

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
          rolls: 2,
        }
        const presenter = new WodPresenter(options)

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
          rolls: 1,
        }
        const presenter = new WodPresenter(options)

        const result = presenter.presentResults()

        expect(result).toMatch("**1**")
      })
    })
  })

  describe("explainPool", () => {
    const default_opts = {
      pool: 5,
      raw: [[3, 4, 5, 5, 8]],
      difficulty: 6,
      rolls: 1,
    }

    it("shows the pool size", () => {
      const presenter = new WodPresenter(default_opts)

      const result = presenter.explainPool()

      expect(result).toMatch("5 diff")
    })

    it("shows the difficulty", () => {
      const presenter = new WodPresenter(default_opts)

      const result = presenter.explainPool()

      expect(result).toMatch("diff 6")
    })

    it("shows specialty if present", () => {
      const presenter = new WodPresenter({
        ...default_opts,
        specialty: true,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("with a specialty")
    })
  })

  describe("notateDice", () => {
    const default_opts = {
      raw: [[1, 4, 6, 8, 10]],
      difficulty: 6,
      rolls: 1,
    }

    it("strikes ones", () => {
      const presenter = new WodPresenter(default_opts)

      const result = presenter.notateDice(0)

      expect(result).toMatch("~~1~~")
    })

    it("highlights successes", () => {
      const presenter = new WodPresenter(default_opts)

      const result = presenter.notateDice(0)

      expect(result).toMatch("**6**")
    })

    it("underlines 10s with specialty", () => {
      const presenter = new WodPresenter({
        ...default_opts,
        specialty: true,
      })

      const result = presenter.notateDice(0)

      expect(result).toMatch("**__10__**")
    })
  })

  describe("explainTally", () => {
    it("shows positive successes", () => {
      const options = {
        raw: [[1, 8, 3, 4, 6]],
        summed: [1],
        difficulty: 6,
        specialty: true,
        pool: 6,
        rolls: 1,
      }
      const presenter = new WodPresenter(options)

      const result = presenter.explainTally(0)

      expect(result).toMatch("**1**")
    })

    it("shows zero with negative successes", () => {
      const options = {
        raw: [[1, 8, 1, 1, 5]],
        summed: [-2],
        difficulty: 6,
        specialty: true,
        pool: 6,
        rolls: 1,
      }
      const presenter = new WodPresenter(options)

      const result = presenter.explainTally(0)

      expect(result).toMatch("**0**")
    })

    it("shows botch when botched", () => {
      const options = {
        raw: [[1, 5, 3, 4, 2]],
        summed: [-1],
        difficulty: 6,
        specialty: true,
        pool: 6,
        rolls: 1,
      }
      const presenter = new WodPresenter(options)

      const result = presenter.explainTally(0)

      expect(result).toMatch("botch")
    })
  })

  describe("botch", () => {
    it("is true with no successes and some ones", () => {
      const options = {
        raw: [[1, 5, 3, 4, 2]],
        summed: [-1],
        difficulty: 6,
        specialty: true,
        pool: 6,
        rolls: 1,
      }
      const presenter = new WodPresenter(options)

      const result = presenter.botch(0)

      expect(result).toBeTruthy()
    })

    it("is false with more successes than ones", () => {
      const options = {
        raw: [[1, 8, 3, 4, 6]],
        summed: [1],
        difficulty: 6,
        specialty: true,
        pool: 6,
        rolls: 1,
      }
      const presenter = new WodPresenter(options)

      const result = presenter.botch(0)

      expect(result).toBeFalsy()
    })

    it("is false with some successes and more ones", () => {
      const options = {
        raw: [[1, 8, 1, 1, 6]],
        summed: [-1],
        difficulty: 6,
        specialty: true,
        pool: 6,
        rolls: 1,
      }
      const presenter = new WodPresenter(options)

      const result = presenter.botch(0)

      expect(result).toBeFalsy()
    })

    it("is false with no successes and no ones", () => {
      const options = {
        raw: [[2, 3, 4, 4, 5]],
        summed: [0],
        difficulty: 6,
        specialty: true,
        pool: 6,
        rolls: 1,
      }
      const presenter = new WodPresenter(options)

      const result = presenter.botch(0)

      expect(result).toBeFalsy()
    })

    it("is false with equal successes and ones", () => {
      const options = {
        raw: [[1, 2, 3, 4, 6]],
        summed: [0],
        difficulty: 6,
        specialty: true,
        pool: 6,
        rolls: 1,
      }
      const presenter = new WodPresenter(options)

      const result = presenter.botch(0)

      expect(result).toBeFalsy()
    })
  })
})
