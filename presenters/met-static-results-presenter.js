const { bold, italic } = require("discord.js")

/**
 * Decorate raw result strings
 *
 * This just adds the standard result emoji to each string
 *
 * @param  {str} result Raw result string
 * @return {str}        Decorated result string
 */
function pretty(result) {
  switch(result) {
    case "rock":
      return ":rock: rock"
    case "paper":
      return ":scroll: paper"
    case "scissors":
      return ":scissors: scissors"
    case "bomb":
      return ":firecracker: bomb"
  }
}

/**
 * Present the results of a single MET roll
 *
 * @param  {str[]} options.thrown      Array of user results
 * @param  {str[]} options.vs          Array of automated opponent results
 * @param  {str[]} options.compared    Array of win/tie/lose comparisons, from the user's POV
 * @param  {str}   options.description Description for the roll
 * @return {str}                       Fully presented roll
 */
function presentOne({thrown, vs, compared, description}) {
  const result = compared[0]
  const user_throw = thrown[0]
  const bot_throw = vs[0]

  let content = "{{userMention}} rolled "

  if (result) {
    content += bold(result)
  } else {
    content += pretty(user_throw)
  }

  if (description) content += ` for "${description}"`

  if (result) {
    content += ` (${pretty(user_throw)} ${italic("vs")} ${pretty(bot_throw)})`
  }

  return content
}

/**
 * Present the results of multiple MET rolls
 *
 * @param  {str[]} options.thrown      Array of user results
 * @param  {str[]} options.vs          Array of automated opponent results
 * @param  {str[]} options.compared    Array of win/tie/lose comparisons, from the user's POV
 * @param  {str}   options.description Description for the roll
 * @return {str}                       Fully presented roll
 */
function presentMany({rolls, thrown, vs, compared, description}) {
  let content = `{{userMention}} rolled ${rolls} times`
  if (description) content += ` for "${description}"`
  content += ":\n"
  content += thrown.map((first, idx) => {
    if (compared[idx]) return `\t${bold(compared[idx])} (${pretty(thrown[idx])} ${italic("vs")} ${pretty(vs[idx])})`
    return `\t${pretty(thrown[idx])}`
  }).join("\n")
  return content
}

module.exports = {
  pretty,
  presentOne,
  presentMany,
  present({rolls, ...opts}) {
    if (rolls > 1) return presentMany({rolls, ...opts})
    return presentOne(opts)
  }
}
