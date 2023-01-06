const EightBallResultsPresenter = require("./eightball-results-presenter")

const { simpleflake } = require("simpleflakes")

describe("present", () => {
  const defaultArgs = {
    doit: false,
    question: "test roll",
    raw: [[1]],
    userFlake: simpleflake(),
  }

  it("mentions the user", () => {
    const result = EightBallResultsPresenter.present(defaultArgs)

    expect(result).toMatch(defaultArgs.userFlake.toString())
  })

  it("includes the question", () => {
    const result = EightBallResultsPresenter.present(defaultArgs)

    expect(result).toMatch(`"${defaultArgs.question}"`)
  })

  it("honors doit override", () => {
    let args = defaultArgs
    args.doit = true

    const result = EightBallResultsPresenter.present(args)

    expect(result).toMatch("Do it")
  })
})
