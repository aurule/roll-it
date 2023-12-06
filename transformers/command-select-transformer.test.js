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
    {label: "test 1", description: "The first test", value: "test 1"},
    {label: "test 2", description: "The second test", value: "test 2"}
  ])
})
