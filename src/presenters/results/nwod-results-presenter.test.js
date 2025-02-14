const { NwodPresenter } = require("./nwod-results-presenter")

describe("NwodPresenter", () => {
  describe("presentResults", () => {
    describe("in 'until' mode", () => {
      it("shows the description, if present", () => {
        const presenter = new NwodPresenter({
          until: 5,
          raw: [[8, 8, 8, 8, 8]],
          summed: [5],
          description: "a test",
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("a test")
      })

      it("describes the until condition", () => {
        const presenter = new NwodPresenter({
          until: 5,
          pool: 6,
          raw: [[8, 8, 8, 8, 8, 2]],
          summed: [5],
          description: "a test",
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("until 5")
      })

      it("describes the number of rolls", () => {
        const presenter = new NwodPresenter({
          until: 5,
          pool: 6,
          raw: [
            [8, 1, 6, 7, 8, 2],
            [8, 3, 4, 5, 8, 2],
          ],
          summed: [2, 2],
          description: "a test",
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("2 rolls")
      })

      it("shows the pool", () => {
        const presenter = new NwodPresenter({
          until: 5,
          pool: 6,
          raw: [[8, 8, 8, 8, 8, 2]],
          summed: [5],
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("6 dice")
      })

      it("shows all results", () => {
        const presenter = new NwodPresenter({
          until: 5,
          pool: 6,
          raw: [
            [8, 4, 9, 2, 1, 2],
            [6, 1, 10, 2, 8, 9, 3],
          ],
          summed: [2, 3],
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**2** (")
        expect(result).toMatch("**3** (")
      })

      it("shows a sum", () => {
        const presenter = new NwodPresenter({
          until: 5,
          pool: 6,
          raw: [
            [8, 4, 9, 2, 1, 2],
            [6, 1, 10, 2, 8, 9, 3],
          ],
          summed: [2, 3],
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**5** of 5 in 2 rolls")
      })
    })

    describe("in 'many' mode", () => {
      it("shows the description, if present", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [
            [8, 4, 9, 2, 1, 2],
            [6, 1, 10, 2, 8, 9, 3],
          ],
          summed: [2, 3],
          description: "a test",
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("a test")
      })

      it("describes the number of rolls", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [
            [8, 4, 9, 2, 1, 2],
            [6, 1, 10, 2, 8, 9, 3],
          ],
          summed: [2, 3],
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("2 times")
      })

      it("shows the pool", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [
            [8, 4, 9, 2, 1, 2],
            [6, 1, 10, 2, 8, 9, 3],
          ],
          summed: [2, 3],
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("6 dice")
      })

      it("shows all results", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [
            [8, 4, 9, 2, 1, 2],
            [6, 1, 10, 2, 8, 9, 3],
          ],
          summed: [2, 3],
          rolls: 2,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**2** (")
        expect(result).toMatch("**3** (")
      })
    })

    describe("in 'one' mode", () => {
      it("shows the description, if present", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [[8, 4, 9, 2, 1, 2]],
          summed: [2],
          description: "a test",
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("a test")
      })

      it("shows the pool", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [[8, 4, 9, 2, 1, 2]],
          summed: [2],
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("6 dice")
      })

      it("shows the result", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [[8, 4, 9, 2, 1, 2]],
          summed: [2],
          rolls: 1,
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**2**")
      })
    })
  })

  describe("notateDice", () => {
    it("displays the correct result", () => {
      const presenter = new NwodPresenter({
        raw: [[2], [3]],
        threshold: 8,
        explode: 10,
        rolls: 1,
      })

      const result = presenter.notateDice(1)

      expect(result).toEqual("3")
    })

    it("displays fails plain", () => {
      const presenter = new NwodPresenter({
        raw: [[2]],
        threshold: 8,
        explode: 10,
        rolls: 1,
      })

      const result = presenter.notateDice(0)

      expect(result).toEqual("2")
    })

    it("displays successes in bold", () => {
      const presenter = new NwodPresenter({
        raw: [[8]],
        threshold: 8,
        explode: 10,
        rolls: 1,
      })

      const result = presenter.notateDice(0)

      expect(result).toEqual("**8**")
    })

    it("displays n-again re-rolls in bold with a bang", () => {
      const presenter = new NwodPresenter({
        raw: [[10]],
        threshold: 8,
        explode: 10,
        rolls: 1,
      })

      const result = presenter.notateDice(0)

      expect(result).toEqual("**10!**")
    })

    describe("rote re-rolls", () => {
      it("displays fails plain with a bang", () => {
        const presenter = new NwodPresenter({
          raw: [[2, 3]],
          threshold: 8,
          explode: 10,
          rote: true,
          pool: 1,
          rolls: 1,
        })

        const result = presenter.notateDice(0)

        expect(result).toMatch("2!")
      })

      it("displays 1s plain with a bang", () => {
        const presenter = new NwodPresenter({
          raw: [[1, 2]],
          threshold: 8,
          explode: 10,
          rote: true,
          pool: 1,
          rolls: 1,
        })

        const result = presenter.notateDice(0)

        expect(result).toMatch("1!")
      })

      it("does not add a bang after initial results", () => {
        const presenter = new NwodPresenter({
          raw: [[2, 3]],
          threshold: 8,
          explode: 10,
          rote: true,
          pool: 1,
          rolls: 1,
        })

        const result = presenter.notateDice(0)

        expect(result).toEqual("2!, 3")
      })

      it("ignores explode re-roll dice", () => {
        const presenter = new NwodPresenter({
          raw: [[2, 10, 5, 6, 1, 4]],
          threshold: 8,
          explode: 10,
          rote: true,
          pool: 3,
          rolls: 1,
        })

        const result = presenter.notateDice(0)

        expect(result).toEqual("2!, **10!**, 5, 6!, 1, 4")
      })

      it("ignores successes", () => {
        const presenter = new NwodPresenter({
          raw: [[9]],
          threshold: 8,
          explode: 10,
          rote: true,
          pool: 1,
          rolls: 1,
        })

        const result = presenter.notateDice(0)

        expect(result).toEqual("**9**")
      })

      describe("with chance", () => {
        it("when result is 1, does not have a bang", () => {
          const presenter = new NwodPresenter({
            raw: [[1]],
            threshold: 10,
            explode: 10,
            rote: true,
            chance: true,
            pool: 1,
            rolls: 1,
          })

          const result = presenter.notateDice(0)

          expect(result).toEqual("1")
        })

        it("when result is 10, it gets a double bang", () => {
          const presenter = new NwodPresenter({
            raw: [[10, 4, 2]],
            threshold: 10,
            explode: 10,
            rote: true,
            chance: true,
            pool: 1,
            rolls: 1,
          })

          const result = presenter.notateDice(0)

          expect(result).toEqual("**10!!**, 4, 2")
        })
      })
    })

    describe("rollPool", () => {
      it("when decreasing, gets decreased pool after first roll", () => {
        const presenter = new NwodPresenter({
          pool: 3,
          raw: [
            [4, 5, 6],
            [2, 3, 4],
            [5, 6, 7],
            [7, 8, 9],
            [1, 2, 3],
          ],
          chance: false,
          decreasing: true,
          rolls: 5,
        })

        const result = presenter.rollPool(2)

        expect(result).toEqual(1)
      })

      it("with flat pools, returns base pool", () => {
        const presenter = new NwodPresenter({
          pool: 3,
          raw: [
            [4, 5, 6],
            [2, 3, 4],
            [5, 6, 7],
            [7, 8, 9],
          ],
          chance: false,
          rolls: 4,
        })

        const result = presenter.rollPool(2)

        expect(result).toEqual(3)
      })
    })

    describe("rollChance", () => {
      it("when decreasing and false, becomes true once rolls exceed base pool", () => {
        const presenter = new NwodPresenter({
          pool: 3,
          raw: [
            [4, 5, 6],
            [2, 3, 4],
            [5, 6, 7],
            [7, 8, 9],
            [1, 2, 3],
          ],
          chance: false,
          decreasing: true,
          rolls: 5,
        })

        const result = presenter.rollChance(3)

        expect(result).toBeTruthy()
      })

      it("with flat pools, returns chance flag", () => {
        const presenter = new NwodPresenter({
          pool: 3,
          raw: [
            [4, 5, 6],
            [2, 3, 4],
            [5, 6, 7],
            [7, 8, 9],
          ],
          chance: false,
          rolls: 4,
        })

        const result = presenter.rollChance(3)

        expect(result).toBeFalsy()
      })
    })

    describe("rollThreshold", () => {
      it("when chance becomes true, returns 10", () => {
        const presenter = new NwodPresenter({
          pool: 3,
          raw: [
            [4, 5, 6],
            [2, 3, 4],
            [5, 6, 7],
            [7, 8, 9],
          ],
          chance: false,
          threshold: 9,
          decreasing: true,
          rolls: 4,
        })

        const result = presenter.rollThreshold(3)

        expect(result).toEqual(10)
      })

      it("with flat pools, returns threshold", () => {
        const presenter = new NwodPresenter({
          pool: 3,
          raw: [
            [4, 5, 6],
            [2, 3, 4],
            [5, 6, 7],
            [7, 8, 9],
          ],
          chance: false,
          threshold: 9,
          rolls: 4,
        })

        const result = presenter.rollThreshold(3)

        expect(result).toEqual(9)
      })
    })
  })
})
