/**
 * General component class
 */
export class Component {
  /**
   * Unique internal name of the component
   *
   * This must be unique across all components in the app.
   *
   * @type {string}
   */
  name

  /**
   * Function to generate the component's data structure.
   *
   * Always receives the appropriate locale.
   *
   * @type Function
   */
  _data

  /**
   * Function to handle the user's interaction with the component
   *
   * This always receives an Interaction object appropriate for the component.
   *
   * @type Function
   */
  _execute

  /**
   * Create a new Component object
   *
   * @param  {string}   name            Unique internal ID of the component
   * @param  {Function} dataFunction    Function to generate the conmponent's data
   * @param  {Function} executeFunction Function to handle component interactions
   * @return {Component}                The new component object
   */
  constructor(name, dataFunction, executeFunction) {
    this.name = name
    this._data = dataFunction
    this._execute = executeFunction
  }

  /**
   * Generate the data for this component.
   *
   * The customId of the component's data must match this component object's
   * `name` property.
   *
   * @param  {string}           locale Locale string
   * @param  {...any}           rest   Other arguments for the data method
   * @return {ComponentBuilder}        Discord component builder object
   */
  data(locale, ...rest) {
    return this._data(locale, ...rest)
  }

  /**
   * Handle user interactions with the component
   *
   * @param  {ComponentInteraction} interaction Discord component interaction object
   * @return {void}                             No return value is expected.
   */
  execute(interaction) {
    return this._execute(interaction)
  }
}
