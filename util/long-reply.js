const { ceil } = require("mathjs")

/**
 * Max message length with built-in room to add a short footer string.
 *
 * @type {Number}
 */
const max_length = 1985

/**
 * Send one or more replies for a long message
 *
 * This is the main entry point for the module, though the other functions can be used on their own.
 *
 * If the message fits in a single discord response, that's all that will be sent. If it needs more,
 * then more will be sent using followUp() calls.
 *
 * @param  {Interaction} interaction Interaction to respond to
 * @param  {str} content             String to send
 * @param  {Object} message_options  Additional message options, like ephemeral.
 * @return {[type]}                  The interaction
 */
function longReply(interaction, content, message_options = {}) {
  const messages = splitMessage(content)
  return multiReply(interaction, messages, message_options)
}

/**
 * Default prefix generator
 *
 * @param  {int} idx Current page number, indexed from 1
 * @param  {int} max Maximum page number
 * @return {str}     Prefix string
 */
function default_prefixer(idx, max) {
  if (idx === 1) return ""

  return `...`
}

/**
 * Default suffix generator
 *
 * @param  {int} idx Current page number, indexed from 1
 * @param  {int} max Maximum page number
 * @return {str}     Suffix string
 */
function default_suffixer(idx, max) {
  return `\n(message ${idx}/${max})`
}

/**
 * Split a string into one or more substrings with a given max length
 *
 * @param  {String}   message    The message to split
 * @param  {String}   separator  Separator character to use to split the string
 * @param  {Number}   max_length Maximum length of a single string
 * @return {String[]}            Array of strings
 */
function splitMessage(message, separator = " ", max_length = 2000, prefixer = default_prefixer, suffixer = default_suffixer) {
  if (message.length <= max_length) {
    return [message]
  }

  const messages = []

  let current_message = message

  var breakpos
  let pagenum = 1
  const max_pages = ceil(current_message.length / max_length)
  const page_length = max_length - prefixer(max_pages, max_pages).length - 3 - suffixer(max_pages, max_pages).length
  while (current_message.length > page_length) {
    breakpos = current_message.lastIndexOf(separator, page_length)
    messages.push(prefixer(pagenum, max_pages) + current_message.slice(0, breakpos) + "..." + suffixer(pagenum, max_pages))
    current_message = current_message.slice(breakpos + separator.length)
    pagenum++
  }
  messages.push(prefixer(pagenum, max_pages) + current_message + suffixer(pagenum, max_pages))

  return messages
}

/**
 * Send one or more responses to an interaction
 *
 * @param  {Interaction} interaction     Interaction to respond to
 * @param  {String[]}    contents        The message contents to send
 * @param  {Object}      message_options Additional options to include with every response
 * @return {Interaction}                 The interaction
 */
async function multiReply(interaction, contents, message_options = {}) {
  if (!contents.length) return;

  await interaction.reply({
    content: contents[0],
    ...message_options
  })

  for (let idx = 1; idx < contents.length; idx++) {
    await interaction.followUp({
      content: contents[idx],
      ...message_options
    })
  }

  return interaction
}

module.exports = {
  longReply,
  default_suffixer,
  splitMessage,
  multiReply,
}
