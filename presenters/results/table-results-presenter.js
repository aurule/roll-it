const { userMention, italic } = require("discord.js")
const { i18n } = require("../../locales")

module.exports = {
  /**
   * Present the results of rolling on a table
   *
   * @param  {Snowflake} opts.userFlake   The discord ID of the user who rolled
   * @param  {int}       opts.rolls       The number of rolls made
   * @param  {str}       opts.tableName   Name of the table rolled
   * @param  {str[]}     opts.results     Array of result strings
   * @param  {str}       opts.description Optional string describing the roll
   * @param  {str}       opts.locale      Name of the locale to get strings for
   * @return {str}                        String detailling the roll and its results
   */
  present({ userFlake, rolls, tableName, results, description, locale = "en-US" } = {}) {
    const t = i18n.getFixedT(locale, "commands", "table.roll")
    const t_args = {
      count: rolls,
      description,
      userMention: userMention(userFlake),
      table: tableName,
      results: results.map(r => `\t${r}`).join("\n"),
      context: description ? "desc" : "bare",
    }
    return t("response", t_args)
  },
}
