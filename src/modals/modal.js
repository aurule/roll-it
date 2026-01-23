/**
 * Abstract class for modal objects
 * @interface
 */
export class Modal {
  /**
   * The unique name of the modal
   *
   * @abstract
   * @type string
   */
  static name

  /**
   * Modal submission interaction
   * @type Interaction
   */
  interaction

  /**
   * Unique ID associated with the modal
   *
   * Typically an internal database ID
   *
   * @type number
   */
  id

  /**
   * Create the modal's data
   *
   * Subclasses should accept whatever data they need as parameters.
   *
   * @abstract
   * @return {ModalBuilder} Modal data object
   */
  static data() {
    throw new Error("The `data` function is not implemented.")
  }

  /**
   * Create a new Modal object
   * @param  {Interaction} modal_interaction Submission interaction
   * @param  {number}      modal_id          Associated ID
   * @return {Modal}                         New Modal object
   */
  constructor(modal_interaction, modal_id) {
    this.interaction = modal_interaction
    this.id = modal_id
  }

  /**
   * Submit the modal
   *
   * @abstract
   * @return {Promise} Submission promise, usually a Message
   */
  async submit() {
    throw new Error("The `submit` function is not implemented.")
  }

  /**
   * Get the values of a string select field
   *
   * @param  {string}   field_name    Name of the field
   * @param  {string[]} default_value Default to return if the field is empty
   * @return {string[]}               Value of the field, or default if the value is empty
   */
  getStringSelectValues(field_name, default_value = []) {
    return this.interaction.fields.getStringSelectValues(field_name) ?? default_value
  }

  /**
   * Get our raw field data
   * @type object<string, any>
   */
  get fields() {
    return this.interaction.fields.fields
  }

  /**
   * Get the value of a text input field
   *
   * @param  {string} field_name    Name of the field
   * @param  {string} default_value Default to return if the field is empty
   * @return {string}               Value of the field, or default if the value is empty
   */
  getTextInputValue(field_name, default_value = "") {
    return this.interaction.fields.getTextInputValue(field_name) ?? default_value
  }

  /**
   * Defer updates to our interaction
   */
  deferUpdate() {
    return this.interaction.deferUpdate()
  }

  /**
   * Reply with a private message
   * @param  {string|MessageBuilder} message The message to send
   */
  whisper(message) {
    return this.interaction.whisper(message)
  }
}
