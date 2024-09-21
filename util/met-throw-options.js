module.exports = {
  /**
   * Get select menu options for a MET throw
   *
   * @param  {Boolean} bomb Whether to include bomb options
   * @return {obj[]}        Array of choice objects
   */
  throwChoices(bomb = false) {
    const choices = [
      { name: "⛰️ Rock", value: "rock" },
      { name: "📜 Paper", value: "paper" },
      { name: "✂️ Scissors", value: "scissors" },
      { name: "🔀⛰️📜✂️ Random Rock-Paper-Scissors", value: "rand" },
    ]

    if (bomb) {
      choices.splice(2, 0, { name: "🧨 Bomb", value: "bomb" })
      choices.push({ name: "🔀⛰️🧨✂️ Random Rock-Bomb-Scissors", value: "rand-bomb" })
    }

    return choices
  },

  throwOptions(bomb = false) {
    return module.exports.throwChoices(bomb).map((choice) => ({label: choice.name, value: choice.value}))
  },

  /**
   * Get select menu options for random MET throw results
   *
   * @param  {Boolean} bomb Whether to include the bomb random option
   * @return {obj[]}        Array of choice objects
   */
  randomChoices(bomb = false) {
    const choices = [
      { name: "🔀⛰️📜✂️ Random Rock-Paper-Scissors", value: "rand" },
    ]

    if (bomb) {
      choices.push({ name: "🔀⛰️🧨✂️ Random Rock-Bomb-Scissors", value: "rand-bomb" })
    }

    return choices
  }
}
