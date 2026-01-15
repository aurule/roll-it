import { TextDisplayBuilder, LabelBuilder, ModalBuilder } from "discord.js"

/**
 * Module with helpers to more fluidly build modals, their components, and related json structures
 *
 * These helpers make use of the discord.js builder classes under the hood, while providing a more concise api
 * for most use cases.
 */

/**
 * Create modal data
 *
 * Modals are limited to five top-level components.
 *
 * @param  {string}             customId   ID of the modal
 * @param  {string}             title      Title to show in the modal's header bar
 * @param  {ComponentBuilder[]} components Array of components to include in the modal
 * @return {Object}             Object of modal data
 */
export function modal(customId, title, components) {
  return new ModalBuilder({
    customId,
    title,
    components,
  })
}

/**
 * Create a text display component
 *
 * @param  {string}             content The text to display
 * @return {TextDisplayBuilder}         Text builder object
 */
export function text(content) {
  return new TextDisplayBuilder().setContent(content)
}

/**
 * Create a labelled input component
 *
 * Modals need all input objects wrapped in a label to provide a title and
 * description. The fields are both tightly limited in length. If there's
 * more to say, use a text display for it.
 *
 * @param  {ComponentBuilder} component   The component to wrap
 * @param  {string}           label_text  Label to show for the component. Max 45 characters.
 * @param  {string}           description Descriptive text for the component. Max 100 characters.
 * @return {LabelBuilder}                 Label builder object
 */
export function label(component, label_text, description) {
  const label = new LabelBuilder({
    label: label_text,
    component,
  })

  if (description) label.setDescription(description)

  return label
}
