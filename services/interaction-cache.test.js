const { Interaction } = require("../testing/interaction")

const interactionCache = require("./interaction-cache")

describe("defaultCacheConstructor", () => {
  it("sets a max size", () => {
    const cache = interactionCache.defaultCacheConstructor()

    expect(cache.maxSize).toBeGreaterThan(0)
  })
})

describe("store", () => {
  it("creates a cache for a new guild", () => {
    const interaction = new Interaction()

    interactionCache.store(interaction)

    expect(interactionCache.has(interaction.guildId)).toBeTruthy()
  })

  it("uses existing cache for old guild", () => {
    const guildId = "testGuild"
    const other_interaction = new Interaction(guildId)
    interactionCache.store(other_interaction)
    const old_count = interactionCache.length
    const interaction = new Interaction(guildId)

    interactionCache.store(interaction)

    expect(interactionCache.length).toEqual(old_count)
  })

  it("stores the command name", () => {
    const interaction = new Interaction()
    interaction.commandName = "d10"

    interactionCache.store(interaction)

    const cached = interactionCache.findByInteraction(interaction)
    expect(cached.commandName).toEqual("d10")
  })

  it("stores the command options", () => {
    const interaction = new Interaction()
    interaction.commandName = "d10"
    interaction.options.data = [{name: "modifier", value: 3}]

    interactionCache.store(interaction)

    const cached = interactionCache.findByInteraction(interaction)
    expect(cached.options.modifier).toEqual(3)
  })

  it("does not choke on an interaction with no options", () => {
    const interaction = new Interaction()
    interaction.commandName = "d10"
    delete interaction.options.data

    interactionCache.store(interaction)

    const cached = interactionCache.findByInteraction(interaction)
    expect(cached).toBeUndefined()
  })
})

describe("findByIds", () => {
  it("returns null for missing guild", () => {
    const result = interactionCache.findByIds("missing", "nope")

    expect(result).toBeUndefined()
  })

  it("returns null for missing entry in existing guild", () => {
    const interaction = new Interaction()
    interaction.commandName = "d10"
    interactionCache.store(interaction)

    const result = interactionCache.findByIds(interaction.guildId, "nope")

    expect(interactionCache.has(interaction.guildId)).toBeTruthy()
    expect(result).toBeUndefined()
  })

  it("returns command and options when found", () => {
    const interaction = new Interaction()
    interaction.commandName = "d10"
    interaction.options.data = [{name: "modifier", value: 3}]
    interactionCache.store(interaction)

    const result = interactionCache.findByIds(interaction.guildId, interaction.id)

    expect(result.commandName).toEqual("d10")
    expect(result.options.modifier).toEqual(3)
  })
})
