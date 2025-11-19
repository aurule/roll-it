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
function presentSkill({
  raw,
  modifier = 0,
  dc = 0,
  rolls = 1,
  description = "",
  locale = "en-US",
} = {}) {
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
function presentSave({
  raw,
  modifier = 0,
  dc = 0,
  rolls = 1,
  description = "",
  locale = "en-US",
} = {}) {
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

/**
 * Get a string describing the result of an attack die
 *
 * Natural 1 and natural 20 have special strings, while all other die values simply report the sum.
 *
 * @param  {number} die Raw die value
 * @param  {number} sum Die value plus modifier
 * @param  {i18n.t} t   Translation function
 * @return {string}     String describing the attack die
 */
function describeDie(die, sum, t) {
  switch (die) {
    case 1:
      return t("roll.1")
    case 20:
      return t("roll.20")
    default:
      return `${sum}`
  }
}

/**
 * Get a string describing an attack's crit range
 *
 * @param  {number} crit Crit threshold value
 * @param  {i18n.t} t    Translation function
 * @return {string}      String describing the crit range
 */
function describeCrit(crit, t) {
  if (crit === 20) return t("crit.20")
  if (crit) return t("crit.range", { crit })
  return t("crit.none")
}

/**
 * Resolve an attack against a specific AC
 *
 * @param  {DndAttack} attack Attack object
 * @param  {number}    ac     Target AC to score a hit
 * @return {string}           Classifier for the attack against the given AC
 */
function resolveAC(attack, ac) {
  if (attack.hit === 1) return "miss"
  if (attack.hit === 20) {
    if (attack.confirm === 1) return "hit.threat.denied"
    if (attack.confirm === 20) return "hit.threat.confirmed"
    if (attack.confirm_total < ac) return "hit.threat.denied"
    if (attack.confirm_total >= ac) return "hit.threat.confirmed"
  }

  if (attack.hit_total < ac) return "miss"
  if (attack.hit >= attack.crit) {
    if (attack.confirm === 1) return "hit.threat.denied"
    if (attack.confirm === 20) return "hit.threat.confirmed"
    if (attack.confirm_total < ac) return "hit.threat.denied"
    if (attack.confirm_total >= ac) return "hit.threat.confirmed"
  }
  return "hit.plain"
}

/**
 * Get the translation key for an attack against unknown AC
 *
 * @param  {DndAttack} attack Attack object
 * @return {string}           Translation key to present the attack
 */
function resolveAmbiguous(attack) {
  switch (attack.hit) {
    case 1:
      return "miss"
    case 20:
      switch (attack.confirm) {
        case 1:
          return "hit.threat.denied"
        case 20:
          return "hit.threat.confirmed"
        default:
          return "hit.threat.maybe"
      }
    default:
      if (attack.hit >= attack.crit) {
        switch (attack.confirm) {
          case 1:
            return "maybe.threat.denied"
          case 20:
            return "maybe.threat.confirmed"
          default:
            return "maybe.threat.maybe"
        }
      }
      return "maybe.plain"
  }
}

/**
 * Present a set of D&D 3.5 attack rolls
 *
 * All attack rolls must use the same modifier and crit threshold, and will be compared against the AC if given.
 *
 * @param  {object}      opts
 * @param  {DndAttack[]} opts.attacks     Array of attack objects
 * @param  {number}      opts.modifier    Number to add to each rolled die
 * @param  {number}      opts.crit        Crit threshold
 * @param  {number}      opts.ac          AC to judge a hit and crit
 * @param  {number}      opts.rolls       Number of attacks made
 * @param  {string}      opts.description Description of the attack action
 * @param  {string}      opts.locale      Locale code
 * @return {string}                       Text for the attack rolls
 */
function presentAttack({
  attacks,
  modifier = 0,
  crit = 20,
  ac = 0,
  rolls = 1,
  description = "",
  locale = "en-US",
} = {}) {
  const t = i18n.getFixedT(locale, "commands", "dnd.attack.result")

  const key = ac ? "ac" : "bare"
  const t_args = {
    ac,
    weapon: t("weapon", { modifier, crit: describeCrit(crit, t) }),
    results: attacks.map((attack) => {
      const atk_key = ac ? resolveAC(attack, ac) : resolveAmbiguous(attack)
      return t(`outcome.${atk_key}`, {
        hit: describeDie(attack.hit, attack.hit_total, t),
        hit_detail: detail(attack.hit, attack.modifier),
        confirm: describeDie(attack.confirm, attack.confirm_total, t),
        c_detail: detail(attack.confirm, attack.modifier),
      })
    }),
    description,
    count: rolls,
    context: description ? "desc" : undefined,
  }
  return t(`header.${key}`, t_args)
}

/**
 * Present a set of D&D 3.5 full attack sequences
 *
 * @param  {object}        opts
 * @param  {number}        opts.swings      Swings in each attack sequence
 * @param  {DndAttack[][]} opts.attacks     Array of attack sequences, each an array of attack objects
 * @param  {number}        opts.modifier    Number to add to each rolled die
 * @param  {number}        opts.crit        Crit threshold
 * @param  {number}        opts.ac          AC to judge a hit and crit
 * @param  {number}        opts.rolls       Number of full attack sequences
 * @param  {string}        opts.description Description of the attack action
 * @param  {string}        opts.locale      Locale code
 * @return {string}                         Text for the attack rolls
 */
function presentFullAttack({
  swings,
  attacks,
  modifier = 0,
  crit = 20,
  ac = 0,
  rolls = 1,
  description = "",
  locale = "en-US",
} = {}) {
  const t = i18n.getFixedT(locale, "commands", "dnd.full-attack.result")
  const t_atk = i18n.getFixedT(locale, "commands", "dnd.attack.result")

  const key = ac ? "ac" : "bare"
  const t_args = {
    ac,
    swings,
    weapon: t_atk("weapon", { modifier, crit: describeCrit(crit, t_atk) }),
    results: attacks.map((sequence, idx) =>
      [
        t("section", { idx: idx + 1, count: swings }),
        ...sequence.map((attack, idx) => {
          const atk_key = ac ? resolveAC(attack, ac) : resolveAmbiguous(attack)
          return `\t${idx+1}. ` + t_atk(`outcome.${atk_key}`, {
            hit: describeDie(attack.hit, attack.hit_total, t_atk),
            hit_detail: detail(attack.hit, attack.modifier),
            confirm: describeDie(attack.confirm, attack.confirm_total, t_atk),
            c_detail: detail(attack.confirm, attack.modifier),
          })
        })
      ].join("\n")
    ).join("\n"),
    description,
    count: rolls,
    context: description ? "desc" : undefined,
  }
  return t(`header.${key}`, t_args)
}

module.exports = {
  detail,
  skillKey,
  presentSkill,
  saveKey,
  presentSave,
  describeDie,
  describeCrit,
  resolveAC,
  resolveAmbiguous,
  presentAttack,
  presentFullAttack,
}
