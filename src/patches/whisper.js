/**
 * This patch creates a small helper method named "whisper" on all interaction objects.
 */

import {
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} from "discord.js"

import * as build from "../util/message-builders.js"

/**
 * Create the whisper method
 */
export function patch(target_klass) {
  /**
   * Reply with an ephemeral message
   *
   * @param  {str}     content The message contents to send
   * @return {Promise}         Interaction response promise
   */
  const whisper = function (content) {
    const message = build.textMessage(content, { secret: true })
    return this.reply(message)
  }

  target_klass.prototype.whisper = whisper
}

/**
 * Patch the default discord interaction classes
 */
export function patchDiscord() {
  const klasses = [
    CommandInteraction,
    ModalSubmitInteraction,
    ButtonInteraction,
    UserSelectMenuInteraction,
    StringSelectMenuInteraction,
    Message,
  ]

  for (const klass of klasses) {
    patch(klass)
  }
}
