import { userMention } from "discord.js"

/**
 * Replace special placeholder with a user mention string
 *
 * @param  {str} initial   Raw string to format
 * @param  {str} userFlake Discord ID of the user whose reference we are inserting
 * @return {str}           String with the placeholder replaced by a user reference link
 */
export function injectMention(initial, userFlake) {
  return initial.replaceAll("{{userMention}}", userMention(userFlake))
}
