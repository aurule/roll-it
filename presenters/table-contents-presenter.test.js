const { presentContents } = require("./table-contents-presenter")

it("shows each line", () => {
  const contents = ["first", "second"]

  const result = presentContents(contents)

  expect(result).toMatch("first")
  expect(result).toMatch("second")
})

it("indexes from 1", () => {
  const contents = ["first", "second"]

  const result = presentContents(contents)

  expect(result).toMatch("1. first")
})
