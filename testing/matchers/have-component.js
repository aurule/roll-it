/**
 * Test whether the given message has a component with the given component_id
 *
 * @param  {any} message      The message to test
 * @param  {str} component_id The custom id to check for
 * @return {obj}              Jest matcher result object
 */
function toHaveComponent(message, component_id) {
  const components = message.components
    .map((row) => row.components.map((c) => c.data.custom_id))
    .flat()

  const hint_options = {
    comment: `${components}.includes(${component_id})`,
    isNot: this.isNot,
    promise: this.promise,
  }

  const pass = message.hasComponent(component_id)

  const response = pass
    ? () =>
        this.utils.matcherHint("toHaveFlag", undefined, undefined, hint_options) +
        "\n\n" +
        `Expected: not ${this.utils.printExpected(component_id)}\n` +
        `Received: ${this.utils.printReceived(components)}`
    : () =>
        this.utils.matcherHint("toHaveFlag", undefined, undefined, hint_options) +
        "\n\n" +
        `Expected: ${this.utils.printExpected(component_id)}\n` +
        `Received: ${this.utils.printReceived(components)}`

  return { actual: components, message: response, pass }
}

module.exports = {
  toHaveComponent,
}
