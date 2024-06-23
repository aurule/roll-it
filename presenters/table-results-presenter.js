const { userMention } = require("discord.js")

module.exports = {
  present({
    userFlake,
    rolls,
    tableName,
    results,
    description,
  }) {
    // single:
    // user rolled on the table "T" (for "desc") and got:
    // \t results[0]

    // multi:
    // user rolled n times on the table "T" (for "desc") and got:
    // \t results...
  }
}
