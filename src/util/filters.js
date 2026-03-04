/**
 * Common filter functions
 */

/**
 * Identify strings that end with the test suffix
 *
 * @param  {string} str File name
 * @return {boolean}    False if the file ends in .test.js, false if not.
 */
export function noTests(str) {
  return !str.endsWith(".test.js")
}

/**
 * Identify strings that are javascript files and not tests
 *
 * @param  {string} str File name
 * @return {boolean}    True if the file ends in .js and is not a test, false otherwise.
 */
export function jsNoTests(str) {
  return str.endsWith(".js") && noTests(str)
}

/**
 * Identify strings that begin with a dot
 *
 * @param  {string} str File name
 * @return {boolean}    True if the file starts with a period, false if not.
 */
export function noDotFiles(str) {
  return str.indexOf(".") !== 0
}
