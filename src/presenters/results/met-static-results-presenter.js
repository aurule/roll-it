const { bold, italic } = require("discord.js")
const { i18n } = require("../../locales")

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
 * @param  {str}    options.throw_request Keyword for the user's request
 * @param  {str}    options.vs_request    Keyword for the automated opponent request
 * @param  {str[]}  options.thrown        Array of user results
 * @param  {str[]}  options.vs            Array of automated opponent results
 * @param  {str[]}  options.compared      Array of win/tie/lose comparisons, from the user's POV
 * @param  {str}    options.description   Description for the roll
 * @param  {i18n.t} options.t             Translation function
 * @return {str}                          Fully presented roll
 */
function presentOne({ throw_request, vs_request, thrown, vs, compared, description, t }) {
  const user_throw = thrown[0]
  const bot_throw = vs[0]

  const t_args = {
    description,
    count: 1,
  }

  const key_parts = ["response"]

  if (vs_request !== "none") {
    const chop_parts = ["response.chops"]
    if (vs_request.includes("bomb")) {
      chop_parts.push("bomb")
    } else {
      chop_parts.push("random")
    }
    chop_parts.push(`${user_throw}-${bot_throw}`)

    const chop_key = chop_parts.join(".")
    t_args.detail = t(chop_key)
    t_args.result = t(`response.outcome.${compared[0]}`)

    key_parts.push("vs")
  } else {
    t_args.result = t(`response.chops.bare.${user_throw}`)
    key_parts.push("bare")
  }

  if (description) {
    key_parts.push("withDescription")
  } else {
    key_parts.push("withoutDescription")
  }

  const key = key_parts.join(".")
  return t(key, t_args)
}

/**
 * Present the results of multiple MET rolls
 *
 * @param  {str}    options.throw_request Keyword for the user's request
 * @param  {str}    options.vs_request    Keyword for the automated opponent request
 * @param  {str[]}  options.thrown        Array of user results
 * @param  {str[]}  options.vs            Array of automated opponent results
 * @param  {str[]}  options.compared      Array of win/tie/lose comparisons, from the user's POV
 * @param  {str}    options.description   Description for the roll
 * @param  {i18n.t} options.t             Translation function
 * @return {str}                          Fully presented roll
 */
function presentMany({ throw_request, vs_request, rolls, thrown, vs, compared, description, t }) {
  const t_args = {
    description,
    count: rolls,
  }

  const key_parts = ["response"]

  if (vs_request !== "none") {
    const key_base = vs_request.includes("bomb") ? "response.chops.bomb" : "response.chops.random"
    t_args.results = thrown
      .map((user_throw, idx) => {
        const bot_throw = vs[idx]
        const result = t(`response.outcome.${compared[idx]}`)
        const detail = t(`${key_base}.${user_throw}-${bot_throw}`)
        return "\t" + t(`response.vs.result`, { result, detail })
      })
      .join("\n")
    key_parts.push("vs")
  } else {
    t_args.results = thrown
      .map((user_throw, idx) => "\t" + t(`response.chops.bare.${user_throw}`))
      .join("\n")
    key_parts.push("bare")
  }

  if (description) {
    key_parts.push("withDescription")
  } else {
    key_parts.push("withoutDescription")
  }

  const key = key_parts.join(".")
  return t(key, t_args)
}

module.exports = {
  pretty,
  presentOne,
  presentMany,
  present({ rolls, locale, ...rollOptions }) {
    const presenter_options = {
      ...rollOptions,
      t: i18n.getFixedT(locale, "commands", "met.static"),
    }
    if (rolls > 1) return presentMany({ rolls, ...presenter_options })
    return presentOne(presenter_options)
  },
}
