const { oneLine } = require("common-tags")

class Stats {
  /**
   * Database object
   * @type Database
   */
  db

  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  logCommand(guildFlake, commandName, locale) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO stats.commands (
        guildFlake,
        command,
        locale
      ) VALUES (
        @guildFlake,
        @command,
        @locale
      )
    `)
    return insert.run({
      guildFlake,
      command: commandName,
      locale,
    })
  }

  logTiming({ event, serialized, context, began, finished }) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO stats.timing (
        event,
        serialized,
        context,
        began,
        finished
      ) VALUES (
        @event,
        @serialized,
        @context,
        @began,
        @finished
      )
    `)
    return insert.run({
      event,
      serialized,
      context,
      began,
      finished,
    })
  }
}

module.exports = {
  Stats,
  metrics: new Stats(),
}
