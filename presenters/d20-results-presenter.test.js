const d20Presenter = require("./d20-results-presenter")

describe("presentOne", () => {
  const defaultArgs = {
    modifier: 0,
    description: "test roll",
    raw: [[1]],
    picked: [{ indexes: [0] }],
  }

  it("includes description if present", () => {
    const result = d20Presenter.presentOne(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("presentMany", () => {
  const defaultArgs = {
    modifier: 0,
    description: "test roll",
    raw: [[1], [2]],
    picked: [{ indexes: [0] }, { indexes: [0] }],
  }

  it("includes description if present", () => {
    const result = d20Presenter.presentMany(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})

describe("detail", () => {
  describe("single die", () => {
    describe("when modifier is zero", () => {
      it("bolds the final result", () => {
        const result = d20Presenter.detail([5], [0], 0)

        expect(result).toMatch("**5**")
      })

      it("has no breakdown", () => {
        const result = d20Presenter.detail([5], [0], 0)

        expect(result).not.toMatch("(")
      })
    })

    describe("when modifier is non-zero", () => {
      it("bolds the final result", () => {
        const result = d20Presenter.detail([5], [0], 3)

        expect(result).toMatch("**8**")
      })

      it("includes breakdown", () => {
        const result = d20Presenter.detail([5], [0], 3)

        expect(result).toMatch("(")
      })
    })
  })

  describe("two dice", () => {
    describe("when modifier is zero", () => {
      it("bolds the final result", () => {
        const result = d20Presenter.detail([5, 18], [1], 0)

        expect(result).toMatch("**18**")
      })

      it("shows the rejected die", () => {
        const result = d20Presenter.detail([5, 18], [1], 0)

        expect(result).toMatch("~~5~~")
      })
    })

    describe("when modifier is non-zero", () => {
      it("bolds the final result", () => {
        const result = d20Presenter.detail([5, 18], [1], 5)

        expect(result).toMatch("**23**")
      })

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
