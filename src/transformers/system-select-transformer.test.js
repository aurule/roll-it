const { stringSelectMenuOptions } = require("../../testing/discord-schemas")

const { systems } = require("../data")
const { transform } = require("./system-select-transformer")

it("creates an array of select options", () => {
  const data = transform(systems, "en-US")

  expect(data).toMatchSchema(stringSelectMenuOptions)
})

it("sets default property based on deployed arg", () => {
  const deployed = ["dnd5e"]

  const data = transform(systems, "en-US", deployed)

  expect(data[0].default).toBeTruthy()
})
