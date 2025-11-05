"use strict"

/**
 * Common filter functions
 */
module.exports = {
  /**
   * Identify strings that end with the test suffix
   *
   * @param  {string} str File name
   * @return {boolean}    False if the file ends in .test.js, false if not.
   */
  noTests: (str) => !str.endsWith(".test.js"),

  /**
   * Identify strings that are javascript files and not tests
   *
   * @param  {string} str File name
   * @return {boolean}    True if the file ends in .js and is not a test, false otherwise.
   */
  jsNoTests: (str) => str.endsWith(".js") && module.exports.noTests(str),

  /**
   * Identify strings that begin with a dot
   *
   * @param  {string} str File name
   * @return {boolean}    True if the file starts with a period, false if not.
   */
  noDotFiles: (str) => str.indexOf(".") !== 0,
}
