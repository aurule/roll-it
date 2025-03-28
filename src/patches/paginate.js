/**
 * This patch creates a helper method named "paginate" on all command interaction objects.
 */

const { CommandInteraction, subtext, MessageFlags } = require("discord.js")
const { ceil } = require("mathjs")
const { i18n } = require("../locales")

/**
 * Default prefix generator
 *
 * @param  {int} page_num Current page number, indexed from 1
 * @return {str}          Prefix string
 */
function prefixer(page_num) {
  if (page_num === 1) return ""

  return "…"
}

/**
 * Default suffix generator
 *
 * @param  {int} page_num   Current page number, indexed from 1
 * @param  {int} page_count Maximum page number
 * @return {str}            Suffix string
 */
function suffixer(page_num, page_count, locale = "en") {
  const t = i18n.getFixedT(locale)
  let continuation = ""
  if (page_num < page_count) continuation = "…"
  return `${continuation}\n${subtext(t("pagination.suffix", { page_num, page_count }))}`
}

/**
 * Split a string into one or more substrings with a given max length
 *
 * @param  {String}   message    The message to split
 * @param  {String}   separator  Separator character to use to split the string
 * @param  {Number}   max_length Maximum length of a single string
 * @return {String[]}            Array of strings
 */
function splitMessage(message, separator = " ", max_length = 2000, locale = "en") {
  if (message.length <= max_length) {
    return [message]
  }

  const messages = []

  let current_message = message

  var breakpos
  let pagenum = 1
  const max_pages = ceil(current_message.length / max_length)
  const page_length =
    max_length - prefixer(max_pages).length - 3 - suffixer(max_pages, max_pages).length
  while (current_message.length > page_length) {
    breakpos = current_message.lastIndexOf(separator, page_length)
    messages.push(
      prefixer(pagenum) + current_message.slice(0, breakpos) + suffixer(pagenum, max_pages),
    )
    current_message = current_message.slice(breakpos + separator.length)
    pagenum++
  }
  messages.push(prefixer(pagenum) + current_message + suffixer(pagenum, max_pages))

  return messages
}

module.exports = {
  /**
   * Create the paginate method
   */
  patch(klass) {
    if (!klass) klass = CommandInteraction

    /**
     * Split a long message if needed and send in multiple replies
     *
     * This is a convenience api that's handy when your content might spill into multiple messages. If you
     * know it will fit in a single message, use rollReply instead.
     *
     * @param  {str}         content    The potentially long string to send
     * @param  {bool}        secret  Whether the messages should be ephemeral
     * @param  {str}         split_on   String to use when separating the content
     * @param  {int}         max_length Maximum length of a single message
     * @return {Interaction}            Interaction object
     */
    klass.prototype.paginate = async function ({ content, secret, split_on, max_length }) {
      const contents = splitMessage(content, split_on, max_length, this.locale)

      for (let idx = 0; idx < contents.length; idx++) {
        const reply_args = {
          content: contents[idx],
        }
        if (secret) {
          reply_args.flags = MessageFlags.Ephemeral
        }

        if (this.replied) await this.followUp(reply_args)
        else await this.reply(reply_args)
      }

      return this
    }
  },

  prefixer,
  suffixer,
  splitMessage,
}
