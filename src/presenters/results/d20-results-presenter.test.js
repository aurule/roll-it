const d20Presenter = require("./d20-results-presenter")
const { i18n } = require("../../locales")

describe("d20 results presenter", () => {
  describe("presentOne", () => {
    const defaultArgs = {
      modifier: 0,
      raw: [[1]],
      picked: [{ indexes: [0] }],
      keep: "all",
      t: i18n.getFixedT("en-US", "commands", "d20"),
    }

    it("includes description if present", () => {
      const result = d20Presenter.presentOne({
        ...defaultArgs,
        description: "test roll",
      })

      expect(result).toMatch('"test roll"')
    })

    it("includes modifier if present", () => {
      const result = d20Presenter.presentOne({
        ...defaultArgs,
        modifier: 8,
      })

      expect(result).toMatch("+ 8")
    })

    it("includes advantage if present", () => {
      const args = {
        ...defaultArgs,
        keep: "highest",
      }

      const result = d20Presenter.presentOne(args)

      expect(result).toMatch("with advantage")
    })

    it("includes disadvantage if present", () => {
      const args = {
        ...defaultArgs,
        keep: "lowest",
      }

      const result = d20Presenter.presentOne(args)

      expect(result).toMatch("with disadvantage")
    })
  })

  describe("presentMany", () => {
    const defaultArgs = {
      modifier: 0,
      raw: [[1], [2]],
      keep: "all",
      picked: [{ indexes: [0] }, { indexes: [0] }],
      t: i18n.getFixedT("en-US", "commands", "d20"),
    }

    it("includes description if present", () => {
      const args = {
        ...defaultArgs,
        description: "test roll",
      }

      const result = d20Presenter.presentMany(args)

      expect(result).toMatch("test roll")
    })

    it("includes modifier if present", () => {
      const args = {
        ...defaultArgs,
        modifier: 7,
      }

      const result = d20Presenter.presentMany(args)

      expect(result).toMatch("+ 7")
    })

    it("includes advantage if present", () => {
      const args = {
        ...defaultArgs,
        keep: "highest",
      }

      const result = d20Presenter.presentMany(args)

      expect(result).toMatch("with advantage")
    })

    it("includes disadvantage if present", () => {
      const args = {
        ...defaultArgs,
        keep: "lowest",
      }

      const result = d20Presenter.presentMany(args)

      expect(result).toMatch("with disadvantage")
    })
  })

  describe("rollResult", () => {
    describe("with a single die", () => {
      it("uses that die", () => {
        const result = d20Presenter.rollResult([5], [0], 0)

        expect(result).toEqual(5)
      })

      it("adds a modifier", () => {
        const result = d20Presenter.rollResult([5], [0], 2)

        expect(result).toEqual(7)
      })
    })

    describe("with multiple dice", () => {
      it("uses the picked die", () => {
        const result = d20Presenter.rollResult([5, 18], [1], 0)

        expect(result).toEqual(18)
      })

      it("adds a modifier", () => {
        const result = d20Presenter.rollResult([5, 18], [1], 2)

        expect(result).toEqual(20)
      })
    })
  })

  describe("detail", () => {
    describe("single die", () => {
      describe("when modifier is zero", () => {
        it("returns a simple breakdown", () => {
          const result = d20Presenter.detail([5], [0], 0)

          expect(result).toMatch("[5]")
        })
      })

      describe("when modifier is non-zero", () => {
        it("includes the modifier", () => {
          const result = d20Presenter.detail([5], [0], 3)

          expect(result).toMatch("[5] + 3")
        })
      })
    })

    describe("two dice", () => {
      describe("when modifier is zero", () => {
        it("shows the rejected die", () => {
          const result = d20Presenter.detail([5, 18], [1], 0)

          expect(result).toMatch("~~5~~")
        })
      })

      describe("when modifier is non-zero", () => {
        it("shows the rejected die", () => {
          const result = d20Presenter.detail([5, 18], [1], 5)

          expect(result).toMatch("~~5~~")
        })

        it("shows a breakdown with modifier", () => {
          const result = d20Presenter.detail([5, 18], [1], 5)

          expect(result).toMatch("+ 5")
        })
      })
    })
  })
})
