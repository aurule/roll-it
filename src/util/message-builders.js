const {
  ActionRowBuilder,
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
} = require("discord.js")

const { forceArray } = require("./force-array")

/**
 * Module with helpers to more fluidly build messages, components, and related json structures
 *
 * These helpers make use of the discord.js builder classes under the hood, while providing a more concise api
 * for most use cases. The paired mocks provide simpler output for testing purposes.
 */
module.exports = {
  /**
   * Create message data
   *
   * This helper creates a message object using message flags and components v2.
   *
   * @param  {ComponentBuilder[]} components     Array of components to include in the message
   * @param  {Object}             options        Message options. Most are passed directly to discord.js.
   * @param  {boolean}            options.secret Whether the message should be ephemeral
   * @return {Object}             Object of message data
   */
  message(components = [], options = {}) {
    const opt_flags = options.flags ?? 0
    let flags = MessageFlags.IsComponentsV2 | opt_flags

    if (options.secret) {
      flags = flags | MessageFlags.Ephemeral
      options.secret = undefined
    }

    return {
      ...options,
      components,
      flags,
    }
  },

  /**
   * Create data for a simple text-only message
   *
   * This simple helper makes it easy to create messages that contain only text.
   *
   * @param  {string} text    Text of the message
   * @param  {Object} options Message options
   * @return {Object}         Message data
   */
  textMessage(text, options = {}) {
    return module.exports.message([module.exports.text(text)], options)
  },

  /**
   * Create a text display component
   *
   * @param  {string}             content The text to display
   * @return {TextDisplayBuilder}         Text builder object
   */
  text(content) {
    return new TextDisplayBuilder().setContent(content)
  },

  /**
   * Create a section component
   *
   * @param  {string[]}       paragraphs Text strings to display
   * @param  {object}         accessory  Accessory component to show alongside the text strings
   * @return {SectionBuilder}            Section builder object
   */
  section(paragraphs, accessory) {
    const texts = forceArray(paragraphs).map((t) => module.exports.text(t))
    return new SectionBuilder({ components: texts, accessory })
  },

  /**
   * Create a separator component
   *
   * @return {SeparatorBuilder} Separator component object
   */
  separator() {
    return new SeparatorBuilder()
  },

  /**
   * Create an action row copmonent
   *
   * @param  {...ComponentBuilder} components One or more component objects
   * @return {ActionRowBuilder}               Action row builder object
   */
  actions(...components) {
    return new ActionRowBuilder().addComponents(components)
  },
}
