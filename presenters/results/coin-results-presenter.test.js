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

  it("includes the user placeholder", () => {
    const result = CoinResultsPresenter.present(defaultArgs)

    expect(result).toMatch("{{userMention}}")
  })

  it("includes description if present", () => {
    const result = CoinResultsPresenter.present(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.description}"`)
  })

  it("includes the call if present", () => {
    const result = CoinResultsPresenter.present({
      ...defaultArgs,
      call: "1",
    })

    expect(result).toMatch("called heads")
  })
})
