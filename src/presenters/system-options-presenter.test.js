import { systems } from "../data/systems.js"

import { systemOptions } from "./system-options-presenter.js"

describe("systems options presenter", () => {
  it("includes every system", () => {
    const options = systemOptions("en-US")

    expect(options.length).toEqual(systems.size)
  })

  it("marks default for systems in selected array", () => {
    const options = systemOptions("en-US", [systems.first().name])

    expect(options[0].default).toBe(true)
  })

  it("correctly shows labels", () => {
    const options = systemOptions("en-US")

    expect(options[1].label).toMatch("Curve")
  })

  it("correctly shows descriptions", () => {
    const options = systemOptions("en-US")

    expect(options[1].description).toMatch("3d6")
  })
})
