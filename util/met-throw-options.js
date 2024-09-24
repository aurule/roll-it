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

  /**
   * Get component select menu options for a MET throw
   *
   * Discord uses a slightly different format for these than for the select menu of a command option. It's
   * infuriating.
   *
   * @param  {Boolean} bomb Whether to include bomb options
   * @return {obj[]}        Array of option objects
   */
  throwOptions(bomb = false) {
    return module.exports
      .throwChoices(bomb)
      .map((choice) => ({ label: choice.name, value: choice.value }))
  },

  /**
   * Select menu options for random MET throw results
   *
   * @type {obj[]} Array of choice objects
   */
  vsChoices: [
    { name: "🔀⛰️📜✂️ Random Rock-Paper-Scissors", value: "rand" },
    { name: "🔀⛰️🧨✂️ Random Rock-Bomb-Scissors", value: "rand-bomb" },
    { name: "🚫 None", value: "none" },
  ],
}
