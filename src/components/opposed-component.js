import { Component } from "./component.js"

/**
 * Class for components used in the met-opposed workflow
 */
export class OpposedComponent extends Component {
  /**
   * Array of states in which the component is valid
   *
   * This must always be a value from db/opposed/Challenge.states.
   *
   * @type {string[]}
   */
  states = []

  /**
   * Create a new Component object
   *
   * @param  {string}   name            Unique internal ID of the component
   * @param  {Function} dataFunction    Function to generate the conmponent's data
   * @param  {Function} executeFunction Function to handle component interactions
   * @param  {...string} states          One or more state values
   * @return {Component}                The new component object
   */
  constructor(name, dataFunction, executeFunction, ...states) {
    super(name, dataFunction, executeFunction)
    this.states = states
  }
}
