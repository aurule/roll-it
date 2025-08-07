/**
 * Pull the first number out of the given content
 *
 * @param  {string}  content String to parse
 * @return {number?}         Extracted number, or null if one is not found
 */
function extractNumber(content) {
  const match = content.replace(/\s/g, "").match(/-?\d+/)
  if (match === null) return undefined
  return parseInt(match[0])
}

module.exports = {
  extractNumber
}
