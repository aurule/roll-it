const Completers = require("./saved-completers")

describe("saved_roll", () => {
  it("searches names by lowercase", () => {
    const rolls = [
      { name: "figaro", id: 1 },
      { name: "FIDO", id: 2 },
    ]

    const result = Completers.saved_roll("fi", rolls)

    const ids = result.map((r) => r.value)
    expect(ids).toContain("1")
    expect(ids).toContain("2")
  })

  it("caps returned names at 100 characters", () => {
    const rolls = [{ name: "a".repeat(101), id: 1 }]

    const result = Completers.saved_roll("a", rolls)

    expect(result[0].name.length).toEqual(100)
  })

  it("sends the id as the value", () => {
    const rolls = [{ name: "very well", id: 5 }]

    const result = Completers.saved_roll("v", rolls)

    expect(result[0].value).toEqual("5")
  })

  it("sends up to 25 options", () => {
    const tables = Array.from({length: 30}, (_x, idx) => ({name: `test${idx}`, id: idx}))

    const result = Completers.saved_roll("", tables)

    expect(result.length).toEqual(25)
  })
})
