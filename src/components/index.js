import installationHandler from "./installation.js"
import opposedHandler from "./opposed.js"
import teamworkHandler from "./teamwork.js"

export const handlers = [installationHandler, opposedHandler, teamworkHandler]

/**
 * Handle a component interaction
 *
 * @param  {Interaction}        interaction       Message component interaction
 * @param  {ComponentHandler[]} handlers_override Array of component handler objects
 * @return {Promise}                              Promise resolving to the outcome of the handler, usually a Message object
 */
export async function handleComponentInteraction(interaction, handlers_override) {
  const our_handlers = handlers_override ?? handlers
  for (const handler of our_handlers) {
    if (handler.canHandle(interaction)) return handler.handle(interaction)
  }
  return false
}
