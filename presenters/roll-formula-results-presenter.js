const { bold, inlineCode } = require("discord.js")
const { evaluate } = require("mathjs")

const { create, all } = require('mathjs')

const math = create(all)
const limitedEvaluate = math.evaluate

math.import({
  'import':     function () { throw new Error('Function import is disabled') },
  'createUnit': function () { throw new Error('Function createUnit is disabled') },
  'evaluate':   function () { throw new Error('Function evaluate is disabled') },
  'parse':      function () { throw new Error('Function parse is disabled') },
  'simplify':   function () { throw new Error('Function simplify is disabled') },
  'derivative': function () { throw new Error('Function derivative is disabled') }
}, { override: true })

   // * @param  {Int}        options.rolls         Total number of rolls to show
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
  present({rolls, ...rollOptions}) {
    if (rolls == 1) {
      return module.exports.presentOne(rollOptions)
    }
    return module.exports.presentMany(rollOptions)
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
   * }
   *
   * @param  {str}   formula     Text of the original formula, before any dice were rolled
   * @param  {str}   description Text describing the roll
   * @param  {Obj[]} results     Array of roll result objects. Must have a single element. See above for format.
   * @return {str}               String of the presented roll result
   */
  presentOne({ formula, description, results }) {
    const {rolledFormula, pools, raw, summed} = results[0]

    let finalSum
    try {
      finalSum = limitedEvaluate(rolledFormula)
    } catch(err) {
      return `Error: ${err.message}`
    }

    let content = `{{userMention}} rolled ${bold(finalSum)}`
    if (description) content += ` for "${description}"`
    content += ` on ${inlineCode(formula)}:`
    content += pools.map((pool, index) => {
      return `\n\t${summed[index]} from ${pool} [${raw[index]}]`
    })
    content += `\n${finalSum} = ${rolledFormula}`
    return content
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
   * }
   *
   * @param  {str}   formula     Text of the original formula, before any dice were rolled
   * @param  {str}   description Text describing the roll
   * @param  {Obj[]} results     Array of roll result objects. See above.
   * @return {str}               String of presented roll results
   */
  presentMany({ formula, description, results }) {
    let content = `{{userMention}} rolled ${results.length} times`
    if (description) content += ` for "${description}"`
    content += ` on ${inlineCode(formula)}:`

    for (const result of results) {
      const {rolledFormula, pools, raw, summed, description} = result

      let finalSum
      try {
        finalSum = limitedEvaluate(rolledFormula)
      } catch(err) {
        return `Error: ${err.message}`
      }

      content += `\n${bold(finalSum)} = ${rolledFormula}`

      content += pools.map((pool, index) => {
        return `\n\t${summed[index]} from ${pool} [${raw[index]}]`
      })
    }

    return content
  }
}
