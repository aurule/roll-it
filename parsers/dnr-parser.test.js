const { present } = require("../presenters/dnr-results-presenter")

const { parse } = require("./dnr-parser")

describe("with junk input", () => {
  it.todo("returns an empty object")
})

describe("minimal output", () => {
  it.todo("extracts the discipline and pain pools")
})

describe.each([
  [
    "single roll",
    {
      rolls: 1,
      raw: [[3]],
      picked: [{ indexes: [0] }],
    },
  ],
  [
    "multiple rolls",
    {
      rolls: 2,
      raw: [[3], [4]],
      picked: [{ indexes: [0] }, { indexes: [0] }],
    },
  ],
])("%s", (_suite, raw_opts) => {
  it.todo("gets the discipline pool")
  it.todo("gets the pain pool")
  it.todo("gets the madness pool when present")
  it.todo("gets the exhaustion pool when present")
  it.todo("gets the talent when present")
})

describe("single roll", () => {
  it.todo("skips rolls")
})

describe("multiple rolls", () => {
  it.todo("gets rolls")
  it.todo("ignores decoy rolls in description")
})
