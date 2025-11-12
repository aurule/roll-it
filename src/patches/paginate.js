/**
 * This patch creates a helper method named "paginate" on all command interaction objects.
 */

const { CommandInteraction } = require("discord.js")
const { i18n } = require("../locales")
const { logger } = require("../util/logger")
const build = require("../util/message-builders")
const api = require("../services/api")

const inline_formatting_regexes = [
  /\*[^\n]+\*/g,
  /_[^\n]+_/g,
  /\|\|[^\n]+\|\|/g,
  /`[^\n]+`/g,
  /\[[^\n]+\]/g,
  /\([^\n]+\)/g,
]

class Paginator {
  /**
   * The original, full-length text to be paginated
   *
   * @type string
   */
  original_text

  /**
   * Maximum number of characters allowed in a single message
   *
   * @type number
   */
  max_characters

  /**
   * Maximum distance from the calculated page length to break on a newline
   *
   * @type number
   */
  newline_margin

  /**
   * Locale code for translating prefix and suffix
   *
   * @type string
   */
  locale

  /**
   * Translation function
   *
   * @type i18n.t
   */
  t

  /**
   * Total number of pages after pagination
   *
   * @type number
   */
  total_pages

  /**
   * Number of characters from the text that can be included in each message
   *
   * Accounts for the locale-specific prefix and suffix, assuming 2-digit total pages.
   *
   * @type number
   */
  page_length

  /**
   * Array of newline indexes within `original_text`
   *
   * @type number[]
   */
  _newlines

  /**
   * Array of inline formatting ranges
   *
   * Each member is an array of (begin, end) indexes within `original_text`. These indexes describe a range of
   * text subject to inline formatting. These ranges are invalid places to paginate, as doing so will break
   * that inline formatting.
   *
   * @type Array<number[]>
   */
  _invalid_ranges

  /**
   * Array of word boundary indexes within `original_text`
   *
   * Unlike `_newlines`, `_segments` is locale-dependent.
   *
   * @type number[]
   */
  _segments


  constructor(original, max_length = 2000, locale = "en-US") {
    this.original_text = original
    this.max_characters = max_length
    this.newline_margin = Math.ceil(max_length / 10)

    this.t = i18n.getFixedT(locale, "translation", "pagination")
    this.locale = this.t("prefix", { context: "first", returnDetails: true }).usedLng

    this.total_pages = 11 // temporary value for computing likely page length
    this.page_length = max_length - this.suffix(10).length - this.prefix(2).length
    this.total_pages = Math.ceil(this.original_text.length / this.page_length)
    this.page_length
  }

  /**
   * Get the prefix string for the given page
   *
   * @param  {number} page_num Page number, starting from 1
   * @return {string}          Prefix string for the given page
   */
  prefix(page_num) {
    const t_args = {
      context: page_num === 1 ? "first" : "others",
      page_num,
    }
    return this.t("prefix", t_args)
  }

  /**
   * Get the suffix string for the given page
   *
   * @param  {number} page_num Page number, starting from 1
   * @return {string}          Suffix string for the given page
   */
  suffix(page_num) {
    const t_args = {
      context: page_num === this.total_pages ? "last" : "others",
      page_num,
      page_count: this.total_pages,
    }
    return this.t("suffix", t_args)
  }

  /**
   * Array of indexes within `original_text` where a newline appears.
   *
   * @return {number[]} Array of newline indexes
   */
  get newlines() {
    if (this._newlines === undefined)
      this._newlines = [...this.original_text.matchAll(/\n/g)].map((m) => m["index"])

    return this._newlines
  }

  /**
   * Array of inline formatting ranges
   *
   * @return {Array<number[]>} Array of start/end indexes for inline formatting ranges
   */
  get invalid_ranges() {
    if (this._invalid_ranges === undefined) {
      this._invalid_ranges = inline_formatting_regexes.flatMap(
        (re) => [...this.original_text.matchAll(re)].map(
          (m) => [m["index"], m["index"] + m[0].length]))
    }

    return this._invalid_ranges
  }

  /**
   * Determine whether a potential breakpoint is valid
   *
   * This checks that the breakpoint does not fall inside one of the inline formatting ranges.
   *
   * @param  {number}  index The breakpoint index to test
   * @return {boolean}       True if the breakpoint falls outside of all inline formatting ranges. False if not.
   */
  breakpoint_is_valid(index) {
    return !this.invalid_ranges.some((range) => range[0] <= index && range[1] >= index)
  }

  /**
   * Array of word-start indexes that would allow page breaks
   *
   * The indexes here fall outside of all inline formatting ranges.
   *
   * @return {number[]} Array of word indexes
   */
  get segments() {
    if (this._segments == undefined) {
      const segmenter = new Intl.Segmenter(this.locale, { granularity: "word" })

      this._segments = []
      for (const segment of segmenter.segment(this.original_text)) {
        if (segment.isWordLike && this.breakpoint_is_valid(segment.index))
          this._segments.push(segment.index)
      }
    }

    return this._segments
  }

  /**
   * Generate messages by pagination
   *
   * @return {string[]} Array of paginated message strings
   */
  messages() {
    if (this.total_pages === 1) return [this.original_text]

    let messages = []
    let page_num = 1
    let page_start = 0
    let page_end = this.page_length
    let breakpoint
    let clobber

    while (page_num <= this.total_pages) {
      if (page_num === this.total_pages) {
        breakpoint = this.original_text.length
      }
      breakpoint = this.newlines.findLast((nl) => nl >= page_end - this.newline_margin && nl <= page_end)
      if (breakpoint === undefined) {
        breakpoint = this.segments.findLast((seg) => seg <= page_end)
        clobber = 0 // don't remove part of a word
      } else {
        clobber = 1 // do remove the newline character
      }

      let message_text = this.original_text.slice(page_start, breakpoint).trim()
      messages.push(this.prefix(page_num) + message_text + this.suffix(page_num))
      page_start = breakpoint + clobber
      page_end = Math.min(page_start + this.page_length, this.original_text.length)
      page_num++
    }

    return messages
  }
}


/**
 * Send a message without referencing our channel ID
 * @param  {Snowflake} channel_id Discord ID of the channel to send the message in
 * @param  {object}    message    Object of message data
 * @return {Promise}              Promise resolving once the API call is made
 */
async function sendDetached(channel_id, message) {
  return api.sendMessage(channel_id, message).catch((err) => {
    logger.error(
      {
        err,
        channel: channel_id,
        args: message,
      },
      "Unable to send detached message",
    )
  })
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
     * @param  {object}      opts
     * @param  {string}      opts.content    The potentially long string to send
     * @param  {boolean}     opts.secret     Whether the messages should be ephemeral
     * @param  {number}      opts.max_length Maximum length of a single message
     * @return {Interaction}                 Interaction object
     */
    klass.prototype.paginate = async function ({ content, secret = false, max_length }) {
      const paginator = new Paginator(content, max_length, this.locale)
      const contents = paginator.messages()

      /**
       * Mode for sending the paginated messages
       *
       * Defaults to "reply", with expected transition to "followup" after the first message is sent. In the
       * case of an "unknown interaction" error from discord, changes to "detached" to send messages without
       * referencing our interaction.
       *
       * @type {"reply" | "followup" | "detached"}
       */
      let mode = "reply"

      for (let idx = 0; idx < contents.length; idx++) {
        const reply_args = build.textMessage(contents[idx], { secret })

        switch (mode) {
          case "reply":
            await this.reply(reply_args).catch((err) => {
              if (err.code === 10062) {
                logger.warn(
                  {
                    err,
                    fn: "reply",
                    args: reply_args,
                  },
                  'Got "Unknown interaction" for "reply". Re-sending this and followups as detached messages.',
                )
                mode = "detached"
                sendDetached(this.channel.id, reply_args)
              }
            })
            break
          case "followup":
            await this.followUp(reply_args).catch((err) => {
              if (err.code === 10062) {
                logger.warn(
                  {
                    err,
                    fn: "followUp",
                    args: reply_args,
                  },
                  'Got "Unknown interaction" for "followUp". Re-sending this and other followups as detached messages.',
                )
                mode = "detached"
                sendDetached(this.channel.id, reply_args)
              }
            })
            break
          case "detached":
            await sendDetached(this.channel.id, reply_args)
            break
        }

        if (mode == "reply" && this.replied) mode = "followup"
      }

      return this
    }
  },
  Paginator,
  sendDetached,
}
