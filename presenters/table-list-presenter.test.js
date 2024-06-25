const { presentList } = require("./table-list-presenter")

it("shows each table's name", () => {
  const tables = [
    {name: "first", description: "desc1"},
    {name: "second", description: "desc2"},
  ]

  const result = presentList(tables)

  expect(result).toMatch("first")
  expect(result).toMatch("second")
})

it("shows each table's description", () => {
  const tables = [
    {name: "first", description: "desc1"},
    {name: "second", description: "desc2"},
  ]

  const result = presentList(tables)

  expect(result).toMatch("desc1")
  expect(result).toMatch("desc2")
})

it("with no tables gives instructions", () => {
  const result = presentList([])

  expect(result).toMatch("no tables")
})
