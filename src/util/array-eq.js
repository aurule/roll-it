module.exports = {
  /**
   * Determine whether two arrays are equal
   *
   * Arrays `a` and `b` are considered equal if they are the same object, OR all of the following are true:
   *
   * - Neither one is `null`-ish
   * - Both have the same length
   * - Every element in `a` appears in `b` at the same index
   *
   * @param  {Array<any>?} a First array to compare
   * @param  {Array<any>?} b Second array to compare
   * @return {bool}          True if the arrays are equal, false if not
   */
  arrayEq(a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false

    return a.every((val, idx) => val === b[idx])
  },
}
