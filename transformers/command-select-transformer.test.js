"use strict"

const { stringSelectMenuOptions } = require("../testing/discord-schemas")
const commands = require("../commands")

const { transform } = require("./command-select-transformer")

it("creates an array of suitable objects", () => {
  const data = transform(commands, "en-US")

  expect(data).toMatchSchema(stringSelectMenuOptions)
})

it("sets default property based on deployed arg", () => {
  const deployed = ["8ball"]

  const data = transform(commands, "en-US", deployed)

  expect(data[0].default).toBeTruthy()
})
