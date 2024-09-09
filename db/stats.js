const { oneLine } = require("common-tags")

class Stats {
  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  logCommand(guildFlake, commandName) {
    const insert = this.db.prepare(oneLine`
      INSERT INTO stats.commands (
        guildFlake,
        command
      ) VALUES (
        @guildFlake,
        @command
      )
    `)
    return insert.run({
      guildFlake,
      command: commandName,
    })
  }
}

module.exports = {
  Stats,
  metrics: new Stats(),
}
