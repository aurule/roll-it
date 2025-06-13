const { Collection } = require("discord.js")

class CachedDb {
  /**
   * Database object
   * @type Database
   */
  db

  /**
   * Cache of prepared queries
   * @type {Collection}
   */
  queries = new Collection()

  constructor(db_obj) {
    this.db = db_obj ?? require("./index").db
  }

  /**
   * Retrieve a possibly cached query
   *
   * Query strings are turned into prepared Statement objects, which are then cached for reuse.
   *
   * @param  {str}       key   Key to associate with the query
   * @param  {str}       query Query string
   * @param  {Boolean}   pluck Value of the query's pluck property
   * @return {Statement}       Prepared query Statement object
   */
  prepared(key, query, pluck = false) {
    return this.queries.ensure(key, () => {
      const prepared = this.db.prepare(query)
      if (pluck) prepared.pluck()
      return prepared
    })
  }
}

module.exports = {
  CachedDb,
}
