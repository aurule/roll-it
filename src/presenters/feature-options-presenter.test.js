import { features } from "../data/features.js.js"

import { featureOptions } from "./feature-options-presenter.js"

describe("features options presenter", () => {
  it("includes every feature", () => {
    const options = featureOptions("en-US")

    expect(options.length).toEqual(features.size)
  })

  it("marks default for features in selected array", () => {
    const options = featureOptions("en-US", [features.first().name])

    expect(options[0].default).toBe(true)
  })

  it("correctly shows labels", () => {
    const options = featureOptions("en-US")

    expect(options[0].label).toMatch("8 Ball")
  })

  it("correctly shows descriptions", () => {
    const options = featureOptions("en-US")

    expect(options[0].description).toMatch("get an answer")
  })
})
