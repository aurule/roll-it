const { randomInt } = require("mathjs")

const rps = Object.freeze(["rock", "paper", "scissors"])
const rbs = Object.freeze(["rock", "bomb", "scissors"])

const request_keywords = Object.freeze(["rock", "paper", "scissors", "bomb", "rand", "rand-bomb", "none"])

const winners = Object.freeze(new Map([
  ["rock", ["scissors"]],
  ["paper", ["rock"]],
  ["bomb", ["rock", "paper"]],
  ["scissors", ["paper", "bomb"]],
]))

/**
 * Roll a d3 for MET
 *
 * @return {int} Integer from 0 to 2
 */
function rand() {
  return randomInt(3)
}

/**
 * Get MET results
 *
 * @param  {Boolean} bomb  Whether to sub bomb for paper
 * @param  {Number}  rolls Number of results to get
 * @return {str[]}         Array of MET results
 */
function roll(bomb = false, rolls = 1) {
  const symbol_set = bomb ? rbs : rps
  return Array.from({ length: rolls }, () => symbol_set.at(rand()))
}

/**
 * Get the outcome of comparing two MET results
 *
 * Rock beats scissors, loses to paper and bomb
 * Paper beats rock, loses to scissors and bomb
 * Scissors beats paper and bomb, loses to rock
 * Bomb beats rock and paper, loses to scissors
 *
 * @param  {str} first  The first MET result
 * @param  {str} second Second MET result
 * @return {str}        Outcome of the comparison
 */
function compare(first, second) {
  if (first == second) return "tie"
  if (second === "none") return ""

  return winners.get(first).includes(second) ? "win" : "lose"
}

/**
 * Generate an array of results from a request
 *
 * The request can be a named symbol, or one of "rand" or "rand-bomb".
 *
 * @param  {str}   request Symbol or set name
 * @param  {int}   rolls   Number of results to create
 * @return {str[]}         Array of result strings.
 */
function handleRequest(request, rolls) {
  switch (request) {
    case "rand":
      return roll(false, rolls)
    case "rand-bomb":
      return roll(true, rolls)
    default:
      return Array.from({ length: rolls }, () => request)
  }
}

module.exports = {
  roll,
  compare,
  handleRequest,
  request_keywords,
}
