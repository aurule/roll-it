import { presentList } from "./table-list-presenter.js"
import { i18n } from "../locales.js"

describe("table list presenter", () => {
  const t = i18n.getFixedT("en-US", "commands", "table.list")

  it("shows each table's name", () => {
    const tables = [
      { name: "first", description: "desc1" },
      { name: "second", description: "desc2" },
    ]

    const result = presentList(tables, t)

    expect(result).toMatch("first")
    expect(result).toMatch("second")
  })

  it("shows each table's description", () => {
    const tables = [
      { name: "first", description: "desc1" },
      { name: "second", description: "desc2" },
    ]

    const result = presentList(tables, t)

    expect(result).toMatch("desc1")
    expect(result).toMatch("desc2")
  })

  it("with no tables gives instructions", () => {
    const result = presentList([], t)

    expect(result).toMatch("no tables")
  })
})
