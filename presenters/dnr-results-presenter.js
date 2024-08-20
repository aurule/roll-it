class DnrPresenter {
  constructor({ pools, description, talent, rolls }) {
    this.pools = pools
    this.description = description
    this.talent = talent
    this.rolls = rolls
  }

  /**
   * Get the mode we're operating under
   *
   * @return {string} Presentation mode based on number of rolls and the "until" option
   */
  get mode() {
    if (this.rolls > 1) {
      return "many"
    } else {
      return "one"
    }
  }

  presentResults() {
    let content = "{{userMention}} rolled"

    switch(this.mode) {
      case "many":
        content += this.presentedDescription()
        content += ` ${this.rolls} times`
        // using a talent
        break
      case "one":
        // success/fail
        // dominant
        content += this.presentedDescription()
        // using a talent
        break
    }

    return content
  }

  /**
   * Format the description
   *
   * Formatted string accounts for whether the description is present and whether we're presenting a single
   * roll or multiples.
   *
   * @return {str} Formatted description string
   */
  presentedDescription() {
    if (!this.description) return ""

    if (this.mode == "one") return ` for "${this.description}"`

    return ` "${this.description}"`
  }

  // get dominant pool
  // save dominance reason after tiebreaking
  // get actual result after talent is applied
  // describePools
  // describeSuccess
}

module.exports = {
  /**
   * Present one or more results from the dnr command
   *
   * @param  {Int}        options.rolls       Total number of rolls to show
   * @param  {...[Array]} options.rollOptions The rest of the options, passed to presentOne or presentMany
   * @return {String}                         String describing the roll results
   */
  present: ({ ...rollOptions }) => {
    const presenter = new DnrPresenter(rollOptions)
    return presenter.presentResults()
  },
}
