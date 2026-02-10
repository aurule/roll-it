import { i18n } from "../locales/index.js"
import { helpTopics } from "../data/help-topics.js"

/**
 * Make an array of all help topics
 *
 * @param  {str}   locale Locale code for translating entries
 * @return {str[]}        Array of markdown-formatted strings for all topics
 */
export function list(locale) {
  const t = i18n.getFixedT(locale, "help")
  return helpTopics.map((_fn, topic) => {
    const title = t(`${topic}.title`)
    const description = t(`${topic}.description`)
    return t("topics.list-entry", { title, description })
  })
}
