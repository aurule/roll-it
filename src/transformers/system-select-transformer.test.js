import stringSelectMenuOptions from "../../testing/discord-schemas/string-select-menu-options.js"

import { systems } from "../data/systems.js"
import { transform } from "./system-select-transformer.js"

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
