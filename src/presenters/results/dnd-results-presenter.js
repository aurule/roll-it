const { i18n } = require("../../locales")
const { operator } = require("../../util/formatters")

/**
 * Generate the details of a roll
 *
 * @param  {number} result   The number rolled on the die
 * @param  {number} modifier Number added to the tie
 * @return {string}          String describing the roll and modifier
 */
function detail(result, modifier) {
  const rolled = `1d20: [${result}]`
  if (modifier) {
    return `${rolled}${operator(modifier)}`
  }
  return rolled
}

/**
 * Get the translation key to use for a given skill result
 *
 * A result >= the given dc is a pass. A result < the dc is a fail. When
 * the dc is falsy, the result is not judged.
 *
 * @param  {number} result Total result
 * @param  {number} dc     Target DC
 * @return {string}        One of "bare", "pass", or "fail"
 */
function skillKey(result, dc) {
  switch (true) {
    case !dc:
      return "bare"
    case result >= dc:
      return "pass"
    default:
      return "fail"
  }
}

/**
 * Present the result of a skill roll
 *
 * @param  {object}     opts
 * @param  {number[][]} opts.raw         Array of raw die rolls
 * @param  {number}     opts.modifier    Number to add to each roll
 * @param  {number}     opts.dc          Target success threshold
 * @param  {number}     opts.rolls       Total number of rolls made
 * @param  {string}     opts.description Description for the roll
 * @param  {string}     opts.locale      Locale code for the translation
 * @return {string}                      Presented results
 */
function presentSkill({ raw, modifier = 0, dc = 0, rolls = 1, description = "", locale } = {}) {
  const t = i18n.getFixedT(locale, "commands", "dnd.skill.result")

  if (rolls === 1) {
    const result = raw[0][0] + modifier

    const key = skillKey(result, dc)
    const t_args = {
      result,
      detail: detail(raw[0][0], modifier),
      dc: dc,
      description,
      context: description ? "desc" : undefined,
    }
    return t(`single.${key}`, t_args)
  }

  const key = dc ? "dc" : "plain"
  const t_args = {
    rolls: raw.map((raw_roll) => {
      const result = raw_roll[0] + modifier
      const details = detail(raw_roll[0], modifier)
      const key = skillKey(result, dc)
      return t(`many.${key}`, { result, detail: details })
    }),
    description,
    dc,
    count: rolls,
    context: description ? "desc" : undefined,
  }
  return t(`many.${key}`, t_args)
}

/**
 * Get the translation key to use for a given save roll and result
 *
 * @param  {number} raw    Raw die roll
 * @param  {number} result Calculated result after modifier
 * @param  {number} dc     Target DC
 * @return {string}        Translation key
 */
function saveKey(raw, result, dc) {
  switch (true) {
    case raw === 20:
      return "autopass"
    case raw === 1:
      return "autofail"
    case !dc:
      return "num"
    case result >= dc:
      return "pass"
    default:
      return "fail"
  }
}

/**
 * Present the result of a save roll
 *
 * @param  {object}     opts
 * @param  {number[][]} opts.raw         Array of raw die rolls
 * @param  {number}     opts.modifier    Number to add to each roll
 * @param  {number}     opts.dc          Target success threshold
 * @param  {number}     opts.rolls       Total number of rolls made
 * @param  {string}     opts.description Description for the roll
 * @param  {string}     opts.locale      Locale code for the translation
 * @return {string}                      Presented results
 */
function presentSave({ raw, modifier = 0, dc = 0, rolls = 1, description = "", locale } = {}) {
  const t = i18n.getFixedT(locale, "commands", "dnd.save.result")

  if (rolls === 1) {
    const die = raw[0][0]
    const result = die + modifier

    const key_parts = ["single"]
    if (dc) {
      key_parts.push("dc")
    } else {
      key_parts.push("bare")
    }

    key_parts.push(saveKey(die, result, dc))
    const t_args = {
      result,
      detail: detail(die, modifier),
      dc: dc,
      description,
      context: description ? "desc" : undefined,
    }
    return t(key_parts.join("."), t_args)
  }

  const key = dc ? "dc" : "plain"
  const t_args = {
    rolls: raw.map((raw_roll) => {
      const die = raw_roll[0]
      const result = die + modifier
      const details = detail(die, modifier)
      const key = saveKey(die, result, dc)
      return t(`many.${key}`, { result, detail: details })
    }),
    description,
    dc,
    count: rolls,
    context: description ? "desc" : undefined,
  }
  return t(`many.${key}`, t_args)
}

module.exports = {
  detail,
  skillKey,
  presentSkill,
  saveKey,
  presentSave,
}
