import { i18n } from "../locales/index.js"
import { topics } from "../data/index.js"

/**
 * Make an array of all help topics
 *
 * @param  {str}   locale Locale code for translating entries
 * @return {str[]}        Array of markdown-formatted strings for all topics
 */
export function list(locale) {
  const t = i18n.getFixedT(locale, "help")
  return topics.map((topic) => {
    const title = t(`${topic.name}.title`)
    const description = t(`${topic.name}.description`)
    return t("topics.list-entry", { title, description })
  })
}
