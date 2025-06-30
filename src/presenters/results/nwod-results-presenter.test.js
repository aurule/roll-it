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

  describe("makeTally", () => {
    describe("with a chance roll and natural 1", () => {
      it("reports a dramatic failure", () => {
        const presenter = new NwodPresenter({
          pool: 1,
          rolls: 1,
          chance: true,
          rote: false,
          threshold: 10,
          explode: 10,
          until: 0,
          decreasing: false,
          raw: [[1]],
          summed: [0],
        })

        const result = presenter.makeTally(0)

        expect(result).toMatch("dramatic failure")
      })
    })

    describe("with a regular result", () => {
      it("shows the total successes", () => {
        const presenter = new NwodPresenter({
          pool: 2,
          rolls: 1,
          chance: false,
          rote: false,
          threshold: 8,
          explode: 10,
          until: 0,
          decreasing: false,
          raw: [[4, 9]],
          summed: [1],
        })

        const result = presenter.makeTally(0)

        expect(result).toMatch("**1**")
      })
    })
  })

  describe("describePool", () => {
    let roll_options

    beforeEach(() => {
      roll_options = {
        pool: 1,
        rolls: 1,
        chance: true,
        rote: false,
        threshold: 10,
        explode: 10,
        until: 0,
        decreasing: false,
        raw: [[1]],
        summed: [0],
      }
    })

    describe("with a chance roll", () => {
      it("names the chance die", () => {
        const presenter = new NwodPresenter(roll_options)

        const result = presenter.describePool()

        expect(result).toMatch("chance die")
      })

      describe("with rote", () => {
        it("names rote benefit", () => {
          roll_options.rote = true
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).toMatch("with rote")
        })
      })

      it("with threshold 10, does not name threshold", () => {
        const presenter = new NwodPresenter(roll_options)

        const result = presenter.describePool()

        expect(result).not.toMatch("succeeding on 10")
      })

      it("with threshold 9, names threshold range", () => {
        roll_options.threshold = 9
        const presenter = new NwodPresenter(roll_options)

        const result = presenter.describePool()

        expect(result).toMatch("succeeding on 9 and up")
      })
    })

    describe("with a regular roll", () => {
      let roll_options

      beforeEach(() => {
        roll_options = {
          pool: 3,
          rolls: 1,
          chance: false,
          rote: false,
          threshold: 8,
          explode: 10,
          until: 0,
          decreasing: false,
          raw: [[1, 5, 8]],
          summed: [1],
        }
      })

      describe("of one die", () => {
        it("uses singular die", () => {
          roll_options.pool = 1
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).toMatch("1 die")
        })
      })

      describe("of many dide", () => {
        it("uses plural dice", () => {
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).toMatch("3 dice")
        })
      })

      describe("threshold", () => {
        it("default 8, does not name threshold", () => {
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).not.toMatch("succeeding on")
        })

        it("9, names range", () => {
          roll_options.threshold = 9
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).toMatch("succeeding on 9 and up")
        })

        it("7, names range", () => {
          roll_options.threshold = 7
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).toMatch("succeeding on 7 and up")
        })

        it("10, names static number", () => {
          roll_options.threshold = 10
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).toMatch("succeeding on 10")
        })
      })

      describe("explode", () => {
        it("default 10, does not name explode", () => {
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).not.toMatch("again")
        })

        it("over 10, names no explodes", () => {
          roll_options.explode = 11
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).toMatch("no 10-again")
        })

        it("9, names 9-again", () => {
          roll_options.explode = 9
          const presenter = new NwodPresenter(roll_options)

          const result = presenter.describePool()

          expect(result).toMatch("with 9-again")
        })
      })

      it("names rote for rote roll", () => {
        roll_options.rote = true
        const presenter = new NwodPresenter(roll_options)

        const result = presenter.describePool()

        expect(result).toMatch("with rote")
      })

      it("names decreasing for decreasing roll", () => {
        roll_options.decreasing = true
        const presenter = new NwodPresenter(roll_options)

        const result = presenter.describePool()

        expect(result).toMatch("decreasing")
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
