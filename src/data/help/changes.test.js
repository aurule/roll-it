import version from "../../version.js"

import { data } from "./changes"

describe("changes help topic", () => {
  it("supplies a version", () => {
    const help_data = data()

    expect(help_data.version).toEqual(version)
  })

  it("supplies recent changes", () => {
    const help_data = data()

    expect(help_data.changelog).toBeTruthy()
  })
})
