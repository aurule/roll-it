/**
 * Test whether the given message has a component with the given component_id
 *
 * @param  {any} message      The message to test
 * @param  {str} component_id The custom id to check for
 * @return {obj}              Jest matcher result object
 */
function toHaveComponent(message, component_id) {
  if (message.hasComponent(component_id)) {
    return {
      message: () =>
        `expected ${this.utils.printReceived(message)} not to have a component with id ${this.utils.printExpected("component_id")}`,
      pass: true,
    }
  } else {
    return {
      message: () =>
        `expected ${this.utils.printReceived(message)} to have a component with id ${this.utils.printExpected("component_id")}`,
      pass: false,
    }
  }
}

module.exports = {
  toHaveComponent,
}
