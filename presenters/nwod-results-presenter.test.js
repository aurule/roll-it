const { NwodPresenter } = require("./nwod-results-presenter")

const { simpleflake } = require("simpleflakes")

describe("NwodPresenter", () => {
  describe("rolls", () => {
    it("matches the number of results", () => {
      const presenter = new NwodPresenter({ raw: [[1], [2]] })

      expect(presenter.rolls).toEqual(2)
    })
  })

  describe("mode", () => {
    describe("when until option true", () => {
      it("returns 'until' with many rolls", () => {
        const presenter = new NwodPresenter({
          until: 2,
          raw: [[1], [2]],
        })

        expect(presenter.mode).toEqual("until")
      })

      it("returns 'until' with one roll", () => {
        const presenter = new NwodPresenter({
          until: 2,
          raw: [[1]],
        })

        expect(presenter.mode).toEqual("until")
      })
    })

    describe("when until option false", () => {
      it("returns 'many' with multiple rolls", () => {
        const presenter = new NwodPresenter({
          until: 0,
          raw: [[1], [2]],
        })

        expect(presenter.mode).toEqual("many")
      })

      it("returns 'one' with one roll", () => {
        const presenter = new NwodPresenter({
          until: 0,
          raw: [[1]],
        })

        expect(presenter.mode).toEqual("one")
      })
    })
  })

  describe("presentResults", () => {
    describe("in 'until' mode", () => {
      it("tags the user", () => {
        const flake = simpleflake().toString()
        const presenter = new NwodPresenter({
          until: 5,
          userFlake: flake,
          raw: [[8, 8, 8, 8, 8]],
          summed: [5],
        })

        const result = presenter.presentResults()

        expect(result).toMatch(flake)
      })

      it("shows the description, if present", () => {
        const presenter = new NwodPresenter({
          until: 5,
          raw: [[8, 8, 8, 8, 8]],
          summed: [5],
          description: "a test",
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
        })

        const result = presenter.presentResults()

        expect(result).toMatch("until 5")
      })

      it("shows the pool", () => {
        const presenter = new NwodPresenter({
          until: 5,
          pool: 6,
          raw: [[8, 8, 8, 8, 8, 2]],
          summed: [5],
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
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**5** of 5 in 2 rolls")
      })
    })

    describe("in 'many' mode", () => {
      it("tags the user", () => {
        const flake = simpleflake().toString()
        const presenter = new NwodPresenter({
          userFlake: flake,
          pool: 6,
          raw: [
            [8, 4, 9, 2, 1, 2],
            [6, 1, 10, 2, 8, 9, 3],
          ],
          summed: [2, 3],
        })

        const result = presenter.presentResults()

        expect(result).toMatch(flake)
      })

      it("shows the description, if present", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [
            [8, 4, 9, 2, 1, 2],
            [6, 1, 10, 2, 8, 9, 3],
          ],
          summed: [2, 3],
          description: "a test",
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
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**2** (")
        expect(result).toMatch("**3** (")
      })
    })

    describe("in 'one' mode", () => {
      it("tags the user", () => {
        const flake = simpleflake().toString()
        const presenter = new NwodPresenter({
          userFlake: flake,
          pool: 6,
          raw: [[8, 4, 9, 2, 1, 2]],
          summed: [2],
        })

        const result = presenter.presentResults()

        expect(result).toMatch(flake)
      })

      it("shows the description, if present", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [[8, 4, 9, 2, 1, 2]],
          summed: [2],
          description: "a test",
        })

        const result = presenter.presentResults()

        expect(result).toMatch("a test")
      })

      it("shows the pool", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [[8, 4, 9, 2, 1, 2]],
          summed: [2],
        })

        const result = presenter.presentResults()

        expect(result).toMatch("6 dice")
      })

      it("shows the result", () => {
        const presenter = new NwodPresenter({
          pool: 6,
          raw: [[8, 4, 9, 2, 1, 2]],
          summed: [2],
        })

        const result = presenter.presentResults()

        expect(result).toMatch("**2**")
      })
    })
  })

  describe("presentedDescription", () => {
    describe("with no description", () => {
      it("is an empty string", () => {
        const presenter = new NwodPresenter({})

        expect(presenter.presentedDescription).toEqual("")
      })
    })

    describe("with a description", () => {
      describe("in 'one' mode", () => {
        it("includes extra word", () => {
          const presenter = new NwodPresenter({
            raw: [[1]],
            description: "test description",
          })

          expect(presenter.presentedDescription).toMatch("for")
        })

        it("wraps the description in quotes", () => {
          const presenter = new NwodPresenter({
            raw: [[1]],
            description: "test description",
          })

          expect(presenter.presentedDescription).toMatch('"test description"')
        })
      })

      it("wraps the description in quotes", () => {
        const presenter = new NwodPresenter({
          raw: [[1], [2]],
          description: "test description",
        })

        expect(presenter.presentedDescription).toMatch('"test description"')
      })
    })
  })

  describe("explainPool", () => {
    it("with 'chance' true, says 'a chance die'", () => {
      const presenter = new NwodPresenter({
        chance: true,
        pool: 1,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("a chance die")
    })

    it("with 'chance' false, shows pool size", () => {
      const presenter = new NwodPresenter({
        pool: 5,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("5")
    })

    it("with pool of one, uses 'die'", () => {
      const presenter = new NwodPresenter({
        pool: 1,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("1 die")
    })

    it("with pool gt one, uses 'dice'", () => {
      const presenter = new NwodPresenter({
        pool: 5,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("5 dice")
    })

    it("shows rote if present", () => {
      const presenter = new NwodPresenter({
        pool: 5,
        rote: true,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("rote")
    })

    it("shows threshold if not default", () => {
      const presenter = new NwodPresenter({
        pool: 5,
        threshold: 9,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("9")
    })

    it("shows explode if not default", () => {
      const presenter = new NwodPresenter({
        pool: 5,
        explode: 8,
      })

      const result = presenter.explainPool()

      expect(result).toMatch("8-again")
    })
  })

  describe("explainRote", () => {
    it("with rote true, returns 'with rote'", () => {
      const presenter = new NwodPresenter({
        rote: true,
      })

      const result = presenter.explainRote()

      expect(result).toMatch("with rote")
    })

    it("with rote false, returns empty", () => {
      const presenter = new NwodPresenter({
        rote: false,
      })

      const result = presenter.explainRote()

      expect(result).toEqual("")
    })
  })

  describe("explainThreshold", () => {
    it("returns an empty string with 8", () => {
      const presenter = new NwodPresenter({
        threshold: 8,
      })

      const result = presenter.explainThreshold()

      expect(result).toEqual("")
    })

    it("returns a description for !=8", () => {
      const presenter = new NwodPresenter({
        threshold: 9,
      })

      const result = presenter.explainThreshold()

      expect(result).toMatch("9 and up")
    })

    it("leaves off gte string for 10", () => {
      const presenter = new NwodPresenter({
        threshold: 10,
      })

      const result = presenter.explainThreshold()

      expect(result).not.toMatch("and up")
    })
  })

  describe("explainExplode", () => {
    it("returns an empty string with 10", () => {
      const presenter = new NwodPresenter({
        explode: 10,
      })

      const result = presenter.explainExplode()

      expect(result).toEqual("")
    })

    it("returns a nope string with >10", () => {
      const presenter = new NwodPresenter({
        explode: 11,
      })

      const result = presenter.explainExplode()

      expect(result).toMatch("no 10-again")
    })

    it("returns a description for <10", () => {
      const presenter = new NwodPresenter({
        explode: 8,
      })

      const result = presenter.explainExplode()

      expect(result).toMatch("8-again")
    })
  })

  describe("explainTally", () => {
    describe("in 'chance' mode with a 1", () => {
      it("returns dramatic failure", () => {
        const presenter = new NwodPresenter({
          chance: true,
          raw: [[1]],
          summed: [[0]],
        })

        const result = presenter.explainTally(0)

        expect(result).toMatch("dramatic failure")
      })

      it("bolds the result", () => {
        const presenter = new NwodPresenter({
          chance: true,
          raw: [[1]],
          summed: [[0]],
        })

        const result = presenter.explainTally(0)

        expect(result).toMatch("**dramatic failure**")
      })
    })

    it("gets correct sum", () => {
      const presenter = new NwodPresenter({
        chance: false,
        raw: [[8], [5]],
        summed: [1, 0],
      })

      const result = presenter.explainTally(1)

      expect(result).toMatch("0")
    })

    it("bolds the sum", () => {
      const presenter = new NwodPresenter({
        chance: false,
        raw: [[8], [5]],
        summed: [1, 0],
      })

      const result = presenter.explainTally(1)

      expect(result).toMatch("**0**")
    })
  })

  describe("notateDice", () => {
    it("displays the correct result", () => {
      const presenter = new NwodPresenter({
        raw: [[2], [3]],
        threshold: 8,
        explode: 10,
      })

      const result = presenter.notateDice(1)

      expect(result).toEqual("3")
    })

    it("displays fails plain", () => {
      const presenter = new NwodPresenter({
        raw: [[2]],
        threshold: 8,
        explode: 10,
      })

      const result = presenter.notateDice(0)

      expect(result).toEqual("2")
    })

    it("displays successes in bold", () => {
      const presenter = new NwodPresenter({
        raw: [[8]],
        threshold: 8,
        explode: 10,
      })

      const result = presenter.notateDice(0)

      expect(result).toEqual("**8**")
    })

    it("displays n-again re-rolls in bold with a bang", () => {
      const presenter = new NwodPresenter({
        raw: [[10]],
        threshold: 8,
        explode: 10,
      })

      const result = presenter.notateDice(0)

      expect(result).toEqual("**10!**")
    })

    describe("rote re-rolls", () => {
      it("displays fails plain with a bang", () => {
        const presenter = new NwodPresenter({
          raw: [[2]],
          threshold: 8,
          explode: 10,
          rote: true,
          pool: 1,
        })

        const result = presenter.notateDice(0)

        expect(result).toEqual("2!")
      })

      it("does not add a bang after initial results", () => {
        const presenter = new NwodPresenter({
          raw: [[2, 3]],
          threshold: 8,
          explode: 10,
          rote: true,
          pool: 1,
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
          })

          const result = presenter.notateDice(0)

          expect(result).toEqual("**10!!**, 4, 2")
        })
      })
    })
  })

  describe("presentResultSet", () => {
    it("shows the tally for each result", () => {
      const presenter = new NwodPresenter({
        raw: [
          [2, 8],
          [4, 3],
        ],
        summed: [1, 0],
      })

      const result = presenter.presentResultSet()

      expect(result).toMatch("1")
      expect(result).toMatch("0")
    })

    it("shows the dice for each result", () => {
      const presenter = new NwodPresenter({
        raw: [
          [2, 8],
          [4, 3],
        ],
        summed: [1, 0],
      })

      const result = presenter.presentResultSet()

      expect(result).toMatch("2, 8")
      expect(result).toMatch("4, 3")
    })
  })
})
