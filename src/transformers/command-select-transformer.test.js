import stringSelectMenuOptions from "../../testing/discord-schemas/string-select-menu-options.js"
import { Magic8Ball } from "../commands/8ball.js"
import { Collection } from "discord.js"

import { transform } from "./command-select-transformer.js"

describe("command select option transformer", () => {
  const commands = new Collection([["8ball", Magic8Ball]])

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
