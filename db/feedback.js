const { oneLine } = require("common-tags")

/**
 * Class for manipulating feedback database records
 */
class Feedback {
  /**
   * Database object
   * @type Database
   */
  db

  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Create a new feedback record
   *
   * @param  {str}   options.userId      ID of the user submitting the feedback
   * @param  {str}   options.content     The feedback message itself
   * @param  {?str}  options.guildId     ID of the guild related to the feedback. Optional.
   * @param  {?str}  options.commandName Name of the command related to the feedback. Optional.
   * @param  {?bool} options.canReply    Whether the user is open to talking about their feedback
   * @return {Info}                      Query info object with `changes` and `lastInsertRowid` properties
   */
  create({ userId, content, guildId, commandName, canReply }) {
    const insert = this.db.prepare(oneLine`
      INSERT OR ROLLBACK INTO feedback (
        userFlake,
        content,
        guildFlake,
        commandName,
        canReply
      ) VALUES (
        @userFlake,
        @content,
        @guildFlake,
        @commandName,
        @canReply
      )
    `)
    return insert.run({
      userFlake: userId,
      content,
      guildFlake: guildId,
      commandName,
      canReply: +!!canReply,
    })
  }

  /**
   * Get the number of feedback records
   *
   * @return {int} Number of feedback records
   */
  count() {
    const select = this.db.prepare("SELECT count(1) FROM feedback")
    select.pluck()
    return select.get()
  }

  /**
   * Get all stored data about a feedback record
   *
   * @example
   * ```js
   * feedback.detail(3)
   * // returns {
   * //   id: 3,
   * //   userFlake: "1234567890",
   * //   content: "A message for you",
   * //   guildFlake: "0987654321",
   * //   commandName: "d20",
   * //   canReply: true,
   * // }
   * ```
   *
   * @param  {int} id   ID of the feedback to get
   * @return {obj}      Object with all the fields of the feedback
   */
  detail(id) {
    const select = this.db.prepare("SELECT * FROM feedback WHERE id = @id")
    const raw_out = select.get({
      id,
    })

    if (raw_out === undefined) return undefined

    return {
      ...raw_out,
      canReply: !!raw_out.canReply,
    }
  }

  /**
   * Get an array of all feedback records
   *
   * Each object represents a single piece of feedback
   *
   * @return {obj[]} Array of feedback objects
   */
  all() {
    const select = this.db.prepare("SELECT * from feedback")
    const raw_out = select.all()

    return raw_out.map((raw) => ({
      ...raw,
      canReply: !!raw.canReply,
    }))
  }
}

module.exports = {
  Feedback,
}
