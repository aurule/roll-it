const { signed } = require("./signed")

it("renders positive addition", () => {
  const result = signed(5)

  expect(result).toMatch(" + 5")
})

it("renders negative addition", () => {
  const result = signed(-5)

  expect(result).toMatch(" - 5")
})

it("ignores zero", () => {
  const result = signed(0)

  expect(result).toMatch("")
})
