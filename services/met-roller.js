const rps = ["rock", "paper", "scissors"]
const rbs = ["rock", "bomb", "scissors"]

const request_keywords = ["rock", "paper", "scissors", "bomb", "rand", "rand-bomb", "none"]

/**
 * Roll a d3 for MET
 *
 * @return {int} Integer from 0 to 2
 */
function rand() {
  return Math.floor(Math.random() * 3)
}

/**
 * Get MET results
 *
 * @param  {Boolean} bomb  Whether to sub bomb for paper
 * @param  {Number}  rolls Number of results to get
 * @return {str[]}         Array of MET results
 */
function roll(bomb = false, rolls = 1) {
  let fn = () => rps.at(rand())
  if (bomb) fn = () => rbs.at(rand())
  return Array.from({length: rolls}, fn)
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

  switch(first) {
    case "rock":
      if (second == "scissors") return "win"
      return "lose"
    case "paper":
      if (second == "rock") return "win"
      return "lose"
    case "bomb":
      if (second == "scissors") return "lose"
      return "win"
    case "scissors":
      if (second == "paper" || second == "bomb") return "win"
      return "lose"
  }
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
  switch(request) {
    case "rand":
      return roll(false, rolls)
    case "rand-bomb":
      return roll(true, rolls)
    default:
      return Array.from({length: rolls}, () => request)
  }
}

module.exports = {
  roll,
  compare,
  handleRequest,
  request_keywords,
}
