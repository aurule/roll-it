const { Interaction } = require("../../testing/interaction")

const interactionCache = require("./interaction-cache")

describe("set", () => {
  it("stores the command name", async () => {
    const interaction = new Interaction()
    interaction.commandName = "d10"

    await interactionCache.set(interaction)

    const cached = await interactionCache.getInteraction(interaction)
    expect(cached.commandName).toEqual("d10")
  })

  it("stores the command options", async () => {
    const interaction = new Interaction()
    interaction.commandName = "d10"
    interaction.options.data = [{ name: "modifier", value: 3 }]

    await interactionCache.set(interaction)

    const cached = await interactionCache.getInteraction(interaction)
    expect(cached.options.modifier).toEqual(3)
  })

  it("does not choke on an interaction with no options", async () => {
    const interaction = new Interaction()
    interaction.commandName = "d10"
    delete interaction.options.data

    await interactionCache.set(interaction)

    const cached = await interactionCache.getInteraction(interaction)
    expect(cached).toBeUndefined()
  })
})
