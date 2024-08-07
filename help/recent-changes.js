const { hideLinkEmbed } = require("discord.js")
const fs = require("fs")
const path = require("path")

const { version } = require("../package.json")

function getChangelog(changelog_version) {
  try {
    return fs.readFileSync(path.join(__dirname, "../changelog", `${changelog_version}.md`))
  } catch (error) {
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
      `Older change logs can be found on github: ${hideLinkEmbed("https://github.com/aurule/roll-it/tree/master/changelog")}`,
    ].join("\n")
  },

  getChangelog,
}
