const { inlineCode, hideLinkEmbed } = require("@discordjs/builders")
const { oneLine } = require("common-tags")

module.exports = {
  name: "about",
  title: "About Roll It",
  description: "Author and license info",
  help() {
    return [
      oneLine`
        Roll It is a Discord bot for rolling dice, and a passion project by Paige Andrews. It
        is built on NodeJS using the excellent discord.js library, among others. Roll It is open source
        software released under the MIT license, reproduced below. The source code is available at
        ${hideLinkEmbed("https://github.com/aurule/roll-it")} and contributions are welcome!
      `,
      "",
      "===== LICENSE =====",
      "MIT License",
      "",
      "Copyright (c) 2022 Paige Andrews",
      "",
      oneLine`
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
      `,
      "",
      oneLine`
        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.
      `,
      "",
      oneLine`
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
      `,
    ].join("\n")
  },
}
