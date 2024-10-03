const { oneLine } = require("common-tags")

/**
 * Class for manipulating bans database records
 */
class UserBans {
  /**
   * ID of the user to use
   * @type str
   */
  userId

  /**
   * Database object
   * @type Database
   */
  db

  constructor(userId, db_obj) {
    this.userId = userId
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Create a new ban record for this user
   *
   * @param  {str} reason Reason for the ban
   * @return {Info}       Query info object with `changes` and `lastInsertRowid` properties
   */
  create(reason) {
    const insert = this.db.prepare(oneLine`
      INSERT OR ROLLBACK INTO bans (
        userFlake,
        reason
      ) VALUES (
        @userFlake,
        @reason
      )
    `)
    return insert.run({
      userFlake: this.userId,
      reason,
    })
  }

  /**
   * Lift an existing ban
   *
   * @param  {int} id     ID of the ban record to lift
   * @param  {str} reason Reason the ban is being lifted
   * @return {Info}       Query info object with `changes` property
   */
  lift(id, reason) {
    const update = this.db.prepare(oneLine`
      UPDATE OR ROLLBACK bans SET
      (
        lifted_reason,
        lifted_at
      ) = (
        @reason,
        CURRENT_TIMESTAMP
      )
      WHERE id = @id AND userFlake = @userFlake
    `)
    return update.run({
      id,
      userFlake: this.userId,
      reason,
    })
  }

  /**
   * Get whether this user has an active ban
   *
   * A user is considered banned if they have one or more ban reords which do not have a lifted_at timestamp.
   *
   * @return {Boolean} True if the user has an active ban, false if not
   */
  is_banned() {
    const select = this.db.prepare(oneLine`
      SELECT 1
      FROM bans
      WHERE userFlake = ? AND lifted_at IS NULL
    `)
    select.pluck()
    const result = select.get(this.userId)
    return !!result
  }

  /**
   * Get the number of ban records for our user
   *
   * @return {int} Number of ban records
   */
  count() {
    const select = this.db.prepare(oneLine`
      SELECT count(1)
      FROM bans
      WHERE userFlake = ?
    `)
    select.pluck()
    return select.get(this.userId)
  }

  /**
   * Get the details of a ban record
   *
   * @param  {int} id ID of the record to get
   * @return {obj}    Ban record info
   */
  detail(id) {
    const select = this.db.prepare(oneLine`
      SELECT *
      FROM bans
      WHERE id = @id AND userFlake = @userFlake
    `)
    return select.get({
      id,
      userFlake: this.userId,
    })
  }
}

module.exports = {
  UserBans,
}
