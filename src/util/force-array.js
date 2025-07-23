module.exports = {
  /**
   * Coerce a value into an array
   *
   * If `thing` is already an array, it is returned as-is. Null and undefined are turned into an empty array.
   * All other non-array values are turned into an array containing `thing`.
   *
   * @param  {any}                 thing The thing to turn into an array
   * @return {Array<typeof thing>}       Array of the thing
   */
  forceArray(thing) {
    if (thing === null || thing === undefined) return []
    return Array.isArray(thing) ? thing : [thing]
  },
}
