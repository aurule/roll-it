const { singularize } = require("./singularize")

it("uses a for consonants", () => {
  const result = singularize("seat")

  expect(result).toEqual("a seat")
})

it("uses an for vowels", () => {
  const result = singularize("apple")

  expect(result).toEqual("an apple")
})

it("handles upper case", () => {
  const result = singularize("Sedan")

  expect(result).toEqual("a Sedan")
})

it("ignores empty word", () => {
  const result = singularize()

  expect(result).toBeUndefined()
})
