const { hideLinkEmbed, hyperlink } = require("discord.js")
const fs = require("fs")
const path = require("path")
const { oneLine } = require("common-tags")

const { version } = require("../package.json")
const { siteLink } = require("../util/site-link")

function getChangelog(changelog_version) {
  try {
    return fs.readFileSync(path.join(__dirname, "../changelog", `${changelog_version}.md`))
  } catch {
    return `no changelog for ${changelog_version}`
  }
}

module.exports = {
  name: "changes",
  title: "Recent Changes",
  description: "See what's new!",
  help() {
    return [
      `Roll It is on version ${version}. Here's what's new!`,
      "",
      getChangelog(version),
      oneLine`
        Older change logs can be found on ${siteLink("Roll It's website", "/versions")} or on
        ${hyperlink("github", hideLinkEmbed("https://github.com/aurule/roll-it/tree/master/changelog"))}
      `,
    ].join("\n")
  },

  getChangelog,
}
