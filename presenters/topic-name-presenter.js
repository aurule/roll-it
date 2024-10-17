const { italic } = require("discord.js")

/**
 * Make a text list of all topics
 *
 * @param  {Collection} all_topics Optional collection of Topic objects. Defaults to the `help` module.
 * @return {str}                   Markdown-formatted string of all topics
 */
function list(all_topics) {
  const topics = all_topics ?? require("../data").help_topics
  return topics.map((t) => `* ${italic(t.title)} - ${t.description}`).join("\n")
}

module.exports = {
  list,
}
