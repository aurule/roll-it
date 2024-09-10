const { inlineCode, hideLinkEmbed, hyperlink, bold } = require("discord.js")
const { oneLine } = require("common-tags")

const { siteLink, rootLink } = require("../util/site-link")

module.exports = {
  name: "about",
  title: "About Roll It",
  description: "Author and license info",
  help() {
    return [
      oneLine`
        ${rootLink("Homepage")} |
        ${hyperlink("Source", hideLinkEmbed("https://github.com/aurule/roll-it"))} |
        ${siteLink("Privacy Policy", "/privacy")} |
        ${siteLink("Terms of Service", "/terms")}
      `,
      "",
      oneLine`
        Roll It is a Discord bot for rolling dice, and a passion project by Paige Andrews. It
        is built on NodeJS using the excellent discord.js library, among others. Roll It is open source
        software released under the ${siteLink("MIT license", "/license")}. The source code is available at
        ${hideLinkEmbed("https://github.com/aurule/roll-it")} and contributions are welcome!
      `,
    ].join("\n")
  },
}
