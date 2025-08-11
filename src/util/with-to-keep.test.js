const { with_to_keep } = require("./with-to-keep")

describe("with_to_keep converter", () => {
  it("translates `advantage` to `highest`", () => {
    const result = with_to_keep("advantage")

    expect(result).toEqual("highest")
  })

  it("translates `disadvantage` to `lowest`", () => {
    const result = with_to_keep("disadvantage")

    expect(result).toEqual("lowest")
  })

  it("translates other strings to `all`", () => {
    const result = with_to_keep("yadda")

    expect(result).toEqual("all")
  })
})
