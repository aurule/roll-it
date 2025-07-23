const { MessageFlags } = require("discord.js")

const { forceArray } = require("../force-array")

module.exports = {
  message: jest.fn((components = [], options = {}) => {
    const opt_flags = options.flags ?? 0
    let flags = MessageFlags.IsComponentsV2 | opt_flags
    if (options.secret) {
      flags = flags | MessageFlags.Ephemeral
      options.secret = undefined
    }

    let paragraphs = []
    let interactables = []

    for (const component of components) {
      if (component.content !== undefined) paragraphs.push(component.content)
      if (component.components !== undefined) interactables.push(component.components)
    }

    return {
      content: paragraphs.join("\n"),
      components: interactables.flat(),
      flags,
      ...options,
    }
  }),
  textMessage: jest.fn((text, options = {}) => {
    return module.exports.message([module.exports.text(text)], options)
  }),
  text: jest.fn((content) => { return { content } }),
  section: jest.fn((paragraphs, accessory) => {
    const texts = forceArray(paragraphs)
    return {
      content: texts.join("\n"),
      components: [accessory],
    }
  }),
  separator: jest.fn(() => "---"),
  actions: jest.fn((...components) => { return { components } }),
}
