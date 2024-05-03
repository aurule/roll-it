const { bold, userMention } = require("discord.js")
const { evaluate } = require("mathjs")

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
   * @param  {Snowflake}  options.userFlake     Snowflake of the user that made the roll
   * @return {String}                           String describing the roll results
   */
  present: ({
    formula,
    rolledFormula,
    pools,
    raw,
    summed,
    description,
    userFlake,
  }) => {
    const finalSum = evaluate(rolledFormula)

    let content = [userMention(userFlake), "rolled", bold(finalSum), "on"]
    if (description) content.push(`"${description}"`)
    content.push(`${formula}:`)
    content = content.concat(
      pools.map((pool, index) => {
        return `\n\t${summed[index]} from ${pool} [${raw[index]}]`
      })
    )
    content.push(`\n${finalSum} = ${rolledFormula}`)
    return content.join(" ")
  },
}
