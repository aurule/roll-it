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

module.exports = {
  /**
   * Present a result from the formula roll command
   *
   * @param  {String}     options.formula       Text of the original formula
   * @param  {String}     options.rolledFormula Text of the formula after generating dice results
   * @param  {Array<String>} options.pools      Array of descriptions for dice pools rolled
   * @param  {Array<Array<Int>>} options.raw    Array of arrays with ints representing the roll for each pool
   * @param  {Array<Int>} options.summed        Array of summed dice rolls
   * @param  {String}     options.description   Text describing the roll
   * @return {String}                           String describing the roll results
   */
  present: ({ formula, rolledFormula, pools, raw, summed, description, userFlake }) => {
    const finalSum = limitedEvaluate(rolledFormula)

    let content = ["{{userMention}} rolled", bold(finalSum), "on"]
    if (description) content.push(`"${description}"`)
    content.push(`${inlineCode(formula)}:`)
    content = content.concat(
      pools.map((pool, index) => {
        return `\n\t${summed[index]} from ${pool} [${raw[index]}]`
      }),
    )
    content.push(`\n${finalSum} = ${rolledFormula}`)
    return content.join(" ")
  },
}
