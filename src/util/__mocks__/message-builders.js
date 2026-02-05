import { MessageFlags } from "discord.js"

import { forceArray } from "../force-array.js"

export const message = vitest.fn((components = [], options = {}) => {
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
    components: [{ components: interactables.flat() }],
    flags,
    hasComponent(search_id) {
      return this.components.some((row) => {
        return row.components.some((component) => {
          return component.data.custom_id === search_id
        })
      })
    },
    ...options,
  }
})

export const textMessage = vitest.fn((text, options = {}) => {
  return message([{ content: text }], options)
})

export const text = vitest.fn((content) => {
  return { content }
})

export const section = vitest.fn((paragraphs, accessory) => {
  const texts = forceArray(paragraphs)
  return {
    content: texts.join("\n"),
    components: [accessory],
  }
})

export const separator = vitest.fn(() => "---")

export const actions = vitest.fn((...components) => {
  return { components }
})
