"use strict"

const { stringSelectMenuOptions } = require("../testing/discord-schemas")

const { withDescriptions, withCommands } = require("./system-select-transformer")

const test_systems = [
  {
    name: "test 1",
    title: "Test 1",
    description: "The first test",
    notes: "Is a test",
    commands: {
      required: ["fate"],
    }
  },
  {
    name: "test 2",
    title: "Test 2",
    description: "The second test",
    notes: "Is a test",
    commands: {
      required: ["fate"],
      recommended: ["drh"],
    }
  },
]

describe("withDescriptions", () => {
  it("creates an array of select options", () => {
    const data = withDescriptions(test_systems)

    expect(data).toMatchSchema(stringSelectMenuOptions)
  })

  it("sets default property based on deployed arg", () => {
    const deployed = ["test 1"]

    const data = withDescriptions(test_systems, deployed)

    expect(data[0].default).toBeTruthy()
  })

  it("shows the system description", () => {
    const data = withDescriptions(test_systems)

    expect(data[0].description).toEqual(test_systems[0].description)
  })
})

describe("withCommands", () => {
  it("creates an array of select options", () => {
    const data = withCommands(test_systems)

    expect(data).toMatchSchema(stringSelectMenuOptions)
  })

  it("sets default property based on deployed arg", () => {
    const deployed = ["test 1"]

    const data = withCommands(test_systems, deployed)

    expect(data[0].default).toBeTruthy()
  })

  it("shows the required commands", () => {
    const data = withCommands(test_systems)

    expect(data[1].description).toMatch("fate")
  })

  it("shows the recommended commands", () => {
    const data = withCommands(test_systems)

    expect(data[1].description).toMatch("drh")
  })
})
