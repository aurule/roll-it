const { bold, italic } = require("discord.js")

/**
 * Decorate raw result strings
 *
 * This primarily adds the standard result emoji to each string. If the request is provided, the result
 * will be tagged as random and having bomb as appropriate.
 *
 * @param  {str} result Raw result string
 * @return {str}        Decorated result string
 */
function pretty(result, request = "") {
  let output = ""

  switch (result) {
    case "rock":
      output = ":rock: rock"
      break
    case "paper":
      output = ":scroll: paper"
      break
    case "scissors":
      output = ":scissors: scissors"
      break
    case "bomb":
      output = ":firecracker: bomb"
      break
  }

  if (request.includes("rand")) {
    output += " [random"
    if (request.includes("bomb")) {
      output += " w/bomb"
    }
    output += "]"
  }

  return output
}

/**
 * Present the results of a single MET roll
 *
 * @param  {str}   options.throw_request Keyword for the user's request
 * @param  {str}   options.vs_request    Keyword for the automated opponent request
 * @param  {str[]} options.thrown        Array of user results
 * @param  {str[]} options.vs            Array of automated opponent results
 * @param  {str[]} options.compared      Array of win/tie/lose comparisons, from the user's POV
 * @param  {str}   options.description   Description for the roll
 * @return {str}                         Fully presented roll
 */
function presentOne({ throw_request, vs_request, thrown, vs, compared, description }) {
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
    content += ` (${pretty(user_throw)} ${italic("vs")} ${pretty(bot_throw, vs_request)})`
  }

  return content
}

/**
 * Present the results of multiple MET rolls
 *
 * @param  {str}   options.throw_request Keyword for the user's request
 * @param  {str}   options.vs_request    Keyword for the automated opponent request
 * @param  {str[]} options.thrown        Array of user results
 * @param  {str[]} options.vs            Array of automated opponent results
 * @param  {str[]} options.compared      Array of win/tie/lose comparisons, from the user's POV
 * @param  {str}   options.description   Description for the roll
 * @return {str}                         Fully presented roll
 */
function presentMany({ throw_request, vs_request, rolls, thrown, vs, compared, description }) {
  let content = `{{userMention}} rolled ${rolls} times`
  if (description) content += ` for "${description}"`
  content += ":\n"
  content += thrown
    .map((user_throw, idx) => {
      if (compared[idx])
        return `\t${bold(compared[idx])} (${pretty(user_throw)} ${italic("vs")} ${pretty(vs[idx], vs_request)})`
      return `\t${pretty(user_throw)}`
    })
    .join("\n")
  return content
}

module.exports = {
  pretty,
  presentOne,
  presentMany,
  present({ rolls, ...opts }) {
    if (rolls > 1) return presentMany({ rolls, ...opts })
    return presentOne(opts)
  },
}
