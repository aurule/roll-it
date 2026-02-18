import stringSelectMenuOptions from "../../testing/discord-schemas/string-select-menu-options.js"
import { commands } from "../commands/index.js"

import "../commands/8ball.js"

import { transform } from "./command-select-transformer.js"

describe("command select option transformer", () => {
  it("creates an array of suitable objects", () => {
    const data = transform(commands, "en-US")

    expect(data).toMatchSchema(stringSelectMenuOptions)
  })

  it("sets default property based on deployed arg", () => {
    const deployed = ["8ball"]

    const data = transform(commands, "en-US", deployed)

    expect(data[0].default).toBeTruthy()
  })
})
