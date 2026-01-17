const { stringSelectMenuOptions } = require("../../testing/discord-schemas")

const { systems } = require("../data/systems.js")
const { transform } = require("./system-select-transformer")

describe("string select options transformer", () => {
  it("creates an array of select options", () => {
    const data = transform(systems, "en-US")

    expect(data).toMatchSchema(stringSelectMenuOptions)
  })

  it("sets default property based on deployed arg", () => {
    const deployed = ["dnd5e"]

    const data = transform(systems, "en-US", deployed)

    expect(data[2].default).toBeTruthy()
  })
})
