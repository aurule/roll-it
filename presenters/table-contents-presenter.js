const { userMention, italic, inlineCode } = require("discord.js")

module.exports = {
  /**
   * Present the contents array of a table
   *
   * @param  {str[]} table_contents Array of table content strings
   * @return {str}                  String with the table's contents and indices
   */
  presentContents(table_contents) {
    return table_contents.map((line, idx) => `${idx + 1}. ${line}`).join("\n")
  },
}
