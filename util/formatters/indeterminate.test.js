const { indeterminate } = require("./indeterminate")

it("uses a for consonants", () => {
  const result = indeterminate("seat")

  expect(result).toEqual("a seat")
})

it("uses an for vowels", () => {
  const result = indeterminate("apple")

  expect(result).toEqual("an apple")
})

it("handles upper case", () => {
  const result = indeterminate("Sedan")

  expect(result).toEqual("a Sedan")
})

it("ignores empty word", () => {
  const result = indeterminate()

  expect(result).toBeUndefined()
})
