const { userMention, italic } = require("discord.js")

module.exports = {
  /**
   * Present the results of rolling on a table
   *
   * @param  {Snowflake} opts.userFlake   The discord ID of the user who rolled
   * @param  {int}       opts.rolls       The number of rolls made
   * @param  {str}       opts.tableName   Name of the table rolled
   * @param  {str[]}     opts.results     Array of result strings
   * @param  {str}       opts.description Optional string describing the roll
   * @return {str}                        String detailling the roll and its results
   */
  present({
    userFlake,
    rolls,
    tableName,
    results,
    description,
  }) {
    let content = `${userMention(userFlake)} rolled`
    if (rolls > 1) content += ` ${rolls} times`
    content += ` on the table ${italic(tableName)}`
    if (description) content += ` for "${description}"`
    content += " and got:"
    content += results
      .map(r => `\n\t${r}`)
      .join("")
    return content
  }
}
