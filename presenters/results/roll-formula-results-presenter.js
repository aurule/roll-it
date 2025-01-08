const { bold, inlineCode } = require("discord.js")

const { FormulaDisabledError } = require("../../errors/formula-disabled-error")
const { i18n } = require("../../locales")

const { create, all } = require("mathjs")

const math = create(all)
const limitedEvaluate = math.evaluate

math.import(
  {
    import: function () {
      throw new FormulaDisabledError("import")
    },
    createUnit: function () {
      throw new FormulaDisabledError("createUnit")
    },
    evaluate: function () {
      throw new FormulaDisabledError("evaluate")
    },
    parse: function () {
      throw new FormulaDisabledError("parse")
    },
    simplify: function () {
      throw new FormulaDisabledError("simplify")
    },
    derivative: function () {
      throw new FormulaDisabledError("derivative")
    },
  },
  { override: true },
)

/**
 * Show the breakdown of the pools in a roll
 *
 * @param  {str[]}        pools  Array of formula specifier strings
 * @param  {Array<int[]>} raw    Array of dice results, one array for each pool and one int for each die in the pool
 * @param  {int[]}        summed Array of summed dice rolls, one int per pool
 * @param  {string}       labels Array of roll labels
 * @return {string}              String with the details of all the pools
 */
function detail({ pools, raw, summed, labels, t }) {
  return pools
    .map((pool, index) => {
      const t_args = {
        sum: summed[index],
        pool,
        raw: raw[index],
        label: labels[index],
      }

      if (labels[index]) {
        return "\t" + t("response.pool.labeled", t_args)
      }
      return "\t" + t("response.pool.bare", t_args)




      // const label = labels[index]
      // let detail_line = `\n\t${summed[index]}`
      // if (label) detail_line += ` ${label}`
      // detail_line += ` from ${pool} [${raw[index]}]`
      // return detail_line
    })
    .join("\n")
}

module.exports = {
  /**
   * Present the results of one or more formula results
   *
   * The `rolls` argument is required for this presenter.
   *
   * The string returned might be an error message if the formula uses one of the disabled functions above.
   *
   * @param  {int}    rolls       Total number of rolls made
   * @param  {...obj} rollOptions Object with the roll results
   * @return {str}                String of presented roll results
   */
  present({ rolls, locale, ...rollOptions }) {
    const t = i18n.getFixedT(locale, "commands", "roll-formula")
    const presenter_options = {
      t,
      ...rollOptions
    }
    if (rolls == 1) {
      return module.exports.presentOne(presenter_options)
    }
    return module.exports.presentMany(presenter_options)
  },

  /**
   * Present the result of a single formula roll
   *
   * Results is an array of objects which have the following structure:
   * {
   *   {string}       rolledFormula The formula with all dice specifiers replaced with their summed values
   *   {str[]}        pools         Array of formula specifier strings
   *   {Array<int[]>} raw           Array of dice results, one array for each pool and one int for each die in the pool
   *   {int[]}        summed        Array of summed dice rolls, one int per pool
   *   {string}       labels        Array of roll labels
   * }
   *
   * @param  {str}    formula     Text of the original formula, before any dice were rolled
   * @param  {str}    description Text describing the roll
   * @param  {Obj[]}  results     Array of roll result objects. Must have a single element. See above for format.
   * @param  {i18n.t} t           Translation function
   * @return {str}                String of the presented roll result
   */
  presentOne({ formula, description, results, t }) {
    const { rolledFormula } = results[0]

    let finalSum
    try {
      finalSum = limitedEvaluate(rolledFormula)
    } catch (err) {
      if (err instanceof FormulaDisabledError) {
        return t("response.disabled", err)
      } else {
        throw err
      }
    }

    const t_args = {
      count: 1,
      description,
      formula,
      final: finalSum,
      pools: detail({t, ...results[0]}),
      total: t("response.total", { final: finalSum, rolled: rolledFormula }),
    }
    key_parts = ["response"]
    if (description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }
    const key = key_parts.join(".")
    return t(key, t_args)
  },

  /**
   * Present the result of multiple formula rolls
   *
   * Results is an array of objects which have the following structure:
   * {
   *   {string}       rolledFormula The formula with all dice specifiers replaced with their summed values
   *   {str[]}        pools         Array of formula specifier strings
   *   {Array<int[]>} raw           Array of dice results, one array for each pool and one int for each die in the pool
   *   {int[]}        summed        Array of summed dice rolls, one int per pool
   *   {string}       labels        Array of roll labels
   * }
   *
   * @param  {str}    formula     Text of the original formula, before any dice were rolled
   * @param  {str}    description Text describing the roll
   * @param  {Obj[]}  results     Array of roll result objects. See above.
   * @param  {i18n.t} t           Translation function
   * @return {str}                String of presented roll results
   */
  presentMany({ formula, description, results, t }) {
    const t_args = {
      count: results.length,
      description,
      formula,
      details: results.map((result, idx) => {
        const { rolledFormula } = result
        let finalSum
        try {
          finalSum = limitedEvaluate(rolledFormula)
        } catch (err) {
          if (err instanceof FormulaDisabledError) {
            return t("response.disabled", err)
          } else {
            throw err
          }
        }

        return t("response.detail", {
          total: t("response.total", { final: finalSum, rolled: rolledFormula }),
          pools: detail({t, ...result}),
        })
      }).join("\n")
    }

    key_parts = ["response"]
    if (description) {
      key_parts.push("withDescription")
    } else {
      key_parts.push("withoutDescription")
    }
    const key = key_parts.join(".")
    return t(key, t_args)
  },
  detail,
  limitedEvaluate,
}
