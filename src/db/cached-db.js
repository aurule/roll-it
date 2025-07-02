const { Collection } = require("discord.js")

/**
 * Database helper superclass to cache prepared statements
 */
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

  /**
   * Create a new CachedDb object
   *
   * If a database connection object is omitted, this will use the default global object.
   *
   * @param  {DB}       db_obj Database object
   * @return {CachedDb}        New CachedDb object
   */
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
   * @param  {Boolean}   pluck Whether to 'pluck' a single value instead of returning a row.
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
