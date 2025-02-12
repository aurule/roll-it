const fs = require("fs")
const path = require("path")

const { version } = require("../../../package.json")
const { i18n } = require("../../locales")

function getChangelog(changelog_version, locale) {
  try {
    return fs.readFileSync(path.join(__dirname, "../../../changelog", `${changelog_version}.md`))
  } catch {
    return i18n.t("help:changes.missing", { version: changelog_version })
  }
}

module.exports = {
  name: "changes",
  help_data(locale) {
    return {
      version,
      changelog: getChangelog(version, locale),
    }
  },
  getChangelog,
}
