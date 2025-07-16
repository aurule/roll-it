/**
 * Determine the roll parameter that will get the bonus
 *
 * @param  {int}         bonus      Bonus that will be applied
 * @param  {string?}     change     Name of the parameter to target
 * @param  {string[]}    changeable Array of roll params that can accept a bonus
 * @return {string|null}            Name of the param to modify, or null
 */
function saved_bonus_target(bonus, change, changeable) {
  if (!bonus) return null
  if (change && changeable.includes(change)) return change
  return changeable[0]
}

module.exports = {
  saved_bonus_target
}
