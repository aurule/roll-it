const fs = require("fs")
const path = require("path")
const { Collection } = require("discord.js")

const { jsNoTests, noDotFiles } = require("../util/filters")

const basename = path.basename(__filename)
const parsersDir = __dirname

const parsers = new Collection()

const contents = fs
  .readdirSync(parsersDir)
  .filter(jsNoTests)
  .filter(noDotFiles)
  .filter((file) => {
    return file !== basename
  })
contents.forEach((parser_file) => {
  const parser = require(path.join(parsersDir, parser_file))
  parsers.set(parser.name, parser)
})

module.exports = parsers
