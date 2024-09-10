const { italic, inlineCode } = require("discord.js")

module.exports = {
  /**
   * Present the list of available tables
   *
   * @param  {obj[]} tables Array of table info objects
   * @return {str}          String with the table names and descriptions
   */
  presentList(tables) {
    if (!tables.length)
      return `There are no tables to roll. Add some with ${inlineCode("/table add")}!`

    let content = "These are the available tables:"
    content += tables.map((t) => `\n* ${italic(t.name)} - ${t.description}`).join("")
    return content
  },
}
