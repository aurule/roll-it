const SingletonPresenter = require("./singleton-results-presenter")

describe("present", () => {
  describe("with one roll", () => {
    let defaultArgs

    beforeEach(() => {
      defaultArgs = {
        modifier: 0,
        description: "test roll",
        raw: [[1]],
        rolls: 1,
      }
    })

    it("includes description if present", () => {
      const result = SingletonPresenter.present(defaultArgs)

      expect(result).toMatch(`"${defaultArgs.description}"`)
    })

    describe("with no modifier", () => {
      beforeEach(() => {
        defaultArgs.modifier = 0
      })

      it("bolds the final result", () => {
        const result = SingletonPresenter.present(defaultArgs)

        expect(result).toMatch("**1**")
      })

      it("has no breakdown", () => {
        const result = SingletonPresenter.present(defaultArgs)

        expect(result).not.toMatch("(")
      })
    })

    describe("with modifier", () => {
      beforeEach(() => {
        defaultArgs.modifier = 3
      })

      it("bolds the final result", () => {
        const result = SingletonPresenter.present(defaultArgs)

        expect(result).toMatch("**4**")
      })

      it("includes breakdown", () => {
        const result = SingletonPresenter.present(defaultArgs)

        expect(result).toMatch("(1 + 3")
      })
    })
  })

  describe("with multiple rolls", () => {
    let defaultArgs

    beforeEach(() => {
      defaultArgs = {
        modifier: 0,
        description: "test roll",
        raw: [[1], [2]],
        rolls: 2,
      }
    })

    it("includes description if present", () => {
      const result = SingletonPresenter.present(defaultArgs)

      expect(result).toMatch(`"${defaultArgs.description}"`)
    })

    describe("with no modifier", () => {
      beforeEach(() => {
        defaultArgs.modifier = 0
      })

      it("bolds the final result", () => {
        const result = SingletonPresenter.present(defaultArgs)

        expect(result).toMatch("**1**")
        expect(result).toMatch("**2**")
      })

      it("has no breakdown", () => {
        const result = SingletonPresenter.present(defaultArgs)

        expect(result).not.toMatch("(")
      })
    })

    describe("with modifier", () => {
      beforeEach(() => {
        defaultArgs.modifier = 3
      })

      it("bolds the final result", () => {
        const result = SingletonPresenter.present(defaultArgs)

        expect(result).toMatch("**4**")
        expect(result).toMatch("**5**")
      })

      it("includes breakdown", () => {
        const result = SingletonPresenter.present(defaultArgs)

        expect(result).toMatch("(1 + 3")
        expect(result).toMatch("(2 + 3")
      })
    })
  })
})
