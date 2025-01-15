const { italic } = require("discord.js")

/**
 * Make an array of all help topics
 *
 * @param  {Collection} all_topics Optional collection of Topic objects. Defaults to the `help` module.
 * @return {str[]}                 Array of markdown-formatted strings for all topics
 */
function list(all_topics) {
  const topics = all_topics ?? require("../data").help_topics
  return topics.map((t) => `* ${italic(t.title)} - ${t.description}`)
}

module.exports = {
  list,
}
