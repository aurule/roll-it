"use strict"

const { transform } = require("./command-select-transformer")

it("creates an array of suitable objects", () => {
  const commands = [
    {
      name: "test 1",
      description: "The first test",
      id: 1,
    },
    {
      name: "test 2",
      description: "The second test",
      id: 2,
    },
  ]

  const data = transform(commands)

  expect(data).toEqual([
    {label: "test 1", description: "The first test", value: "test 1", default: false},
    {label: "test 2", description: "The second test", value: "test 2", default: false}
  ])
})

it("sets default property based on deployed arg", () => {
  const commands = [
    {
      name: "test 1",
      description: "The first test",
      id: 1,
    },
    {
      name: "test 2",
      description: "The second test",
      id: 2,
    },
  ]
  const deployed = ["test 1"]

  const data = transform(commands, deployed)

  expect(data[0].default).toBeTruthy()
})
