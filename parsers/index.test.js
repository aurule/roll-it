const commands = require("../commands")

const parsers = require("./index")

it("loads parser files", () => {
  expect(parsers.size).toBeGreaterThan(0)
})

it("indexes parsers by name", () => {
  expect(parsers.get("invocation").name).toEqual("invocation")
})

it("excludes the index", () => {
  expect(parsers.get(undefined)).toBeFalsy()
})

describe("savable command parsers", () => {
  it.each(
    Array.from(commands.savable().keys().map(k => [k])),
  )("has a parser for %s output", (command_name) => {
    expect(parsers.get(command_name)).toBeTruthy()
  })
})
