const CoinResultsPresenter = require("./coin-results-presenter")

const { simpleflake } = require("simpleflakes")

describe("present", () => {
  const defaultArgs = {
    static_test: false,
    bomb: false,
    description: "test roll",
    raw: [[1]],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = CoinResultsPresenter.present(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes description if present", () => {
    const result = CoinResultsPresenter.present(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })
})
