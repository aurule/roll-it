const { italic } = require("discord.js")

/**
 * Make an array of all help topics
 *
 * @param  {str}   locale Locale code for translating entries
 * @return {str[]}        Array of markdown-formatted strings for all topics
 */
function list(locale) {
  const t = i18n.getFixedT(locale, "help")
  const topics = require("../data").help_topics
  return topics.map((topic) => {
    const title = t(`${topic.name}.title`)
    const description = t(`${topic.name}.description`)
    return t("topics.list-entry", { title, description })
  })
}

module.exports = {
  list,
}
