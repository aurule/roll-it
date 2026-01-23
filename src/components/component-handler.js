import { Collection } from "discord.js"

/**
 * Regex matching an underscore followed by one or more digits
 * @type {RegExp}
 */
const num_regex = new RegExp(/_\d+/, "gi")

/**
 * Class for building component interaction handlers
 */
export class ComponentHandler {
  /**
   * Collection of component objects, keyed by name
   * @type Collection<Component>
   */
  components

  /**
   * Handler function
   * @type Function
   */
  _handle

  /**
   * Create a new ComponentHandler
   * @param  {Function}         handleFunction Interaction handler function
   * @param  {Component[]}      components     Array of component objects this handler is responsible for
   * @return {ComponentHandler}                New ComponentHandler object
   */
  constructor(handleFunction, components) {
    this._handle = handleFunction
    this.components = new Collection(components.map(c => [c.name, c]))
  }

  /**
   * Helper to remove a trailing ID from a component customId
   *
   * This allows components to embed a database ID in their customId field
   * using the form `my_custom_id_4`.
   *
   * @param  {string} rawId The customId field from Discord
   * @return {string}       The customId with any trailing numbers removed
   */
  sanitizeId(rawId) {
    return rawId.replaceAll(num_regex, "")
  }

  /**
   * Determine whether a component belongs to this handler
   *
   * Incoming interactions may be of types Button, StringSelectMenu,
   * UserSelectMenu, RoleSelectMenu, ChannelSelectMenu, or
   * MentionableSelectMenu.
   *
   * @param  {Interaction} interaction The interaction to handle
   * @return {boolean}                 True if this handler can take the interaction, false if not.
   */
  canHandle(interaction) {
    return this.components.has(this.sanitizeId(interaction.customId))
  }

  /**
   * Dispatch the interaction
   *
   * Individual instances must supply a handler function that can take care of
   * all domain-specific logic for their components.
   *
   * @param  {Interaction} interaction Discord interaction object
   * @return {any}                     Whatever is returned by the implemented handler
   */
  async handle(interaction) {
    return this._handle(interaction)
  }
}
