const { pretty } = require("../../presenters/met-static-results-presenter")
const { handleRequest } = require("../met-roller")

/**
 * Class to manage a single met-rps chop
 *
 * Each chop is meant to be immutable. Once it's created, the request cannot be changed. Once roll() is
 * called, the result cannot be changed.
 */
module.exports = class Chop {
  #_request
  #_result

  /**
   * Create a new Chop
   * @param  {str} request Chop request string
   */
  constructor(request) {
    this.#_request = request
  }

  /**
   * Result of the chop
   *
   * This is not populated until roll() is called and cannot be changed from outside.
   *
   * @type {str|undefined}
   */
  get result() {
    return this.#_result
  }

  /**
   * Request for the chop
   * @type {str}
   */
  get request() {
    return this.#_request
  }

  /**
   * Generate a result from our saved request
   *
   * This method is idempotent. The first time it runs, the result is set. Afterward, that same result is
   * always returned.
   *
   * @return {str} The chop's result
   */
  roll() {
    if (this.#_result === undefined) {
      this.#_result = handleRequest(this.#_request, 1)[0]
    }
    return this.#_result
  }

  /**
   * Display this chop nicely
   *
   * @return {str} Decorated chop result
   */
  present() {
    return pretty(this.result)
  }
}
