const Completers = require("./table-completers")

describe("table", () => {
  it("searches names by lowercase", () => {
    const tables = [
      { name: "figaro", id: 1 },
      { name: "FIDO", id: 2 },
    ]

    const result = Completers.table("fi", tables)

    const ids = result.map((r) => r.value)
    expect(ids).toContain("1")
    expect(ids).toContain("2")
  })

  it("caps returned names at 100 characters", () => {
    const tables = [{ name: "a".repeat(101), id: 1 }]

    const result = Completers.table("a", tables)

    expect(result[0].name.length).toEqual(100)
  })

  it("sends the id as the value", () => {
    const tables = [{ name: "very well", id: 5 }]

    const result = Completers.table("v", tables)

    expect(result[0].value).toEqual("5")
  })

  it("sends up to 25 options", () => {
    const tables = Array.from({ length: 30 }, (_x, idx) => ({
      name: `test${idx}`,
      id: idx,
    }))

    const result = Completers.table("", tables)

    expect(result.length).toEqual(25)
  })
})
