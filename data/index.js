const fs = require("fs")
const path = require("path")
const { Collection } = require("discord.js")

const { jsNoTests, noDotFiles } = require("../util/filters.js")

function load_dir(dirname) {
  const datas = new Collection()
  
  const data_dir = path.join(__dirname, dirname)
  fs.readdirSync(data_dir)
    .filter(jsNoTests)
    .filter(noDotFiles)
    .forEach((file) => {
      const data_obj = require(path.join(data_dir, file))
      datas.set(data_obj.name, data_obj)
    })
  
  return datas
}

const data_collections = {
  help_topics: load_dir("help"),
  systems: load_dir("systems"),
}

module.exports = {
  load_dir,
  ...data_collections,
}
