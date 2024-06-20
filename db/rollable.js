const { db } = require("./db")

// schema
// * guildId
// * name
// * description
// * die (derived when contents changes)
// * contents: json array

class Rollables {
  constructor(guildId) {
    this.guildId = guildId
  }

  create(name, description, contents) {
    // make a new table with the given data
    // derive die from contents.length
    // validate contents.length is > 1
    // it's caller's job to make sure the name is unique, or to catch the database error that follows
  }

  list() {
    // get name, description, and die for all tables
  }

  length(id) {
    // get the die for the given ID
  }

  result(id, lineNo) {
    // get the string in contents[lineNo]
  }

  update(id, name, description, contents) {
    // alter the given data pieces
    // update die to eq new contents.length
  }

  count() {
    // return simple count of all rollables for the guild
  }

  options() {
    // return name, description and id for every table
  }
}

module.exports = {
  Rollables
}
