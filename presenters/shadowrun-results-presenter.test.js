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

  describe("presentResultSet", () => {
    it.todo("shows the tally for each result")

    it.todo("shows the dice for each result")
  })
})
