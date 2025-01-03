const EightBallResultsPresenter = require("./8ball-results-presenter")

describe("present", () => {
  const defaultArgs = {
    doit: false,
    question: "test roll",
    raw: [[1]],
  }

  it("includes the user placeholder", () => {
    const result = EightBallResultsPresenter.present(defaultArgs)

    expect(result).toMatch("{{userMention}}")
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
