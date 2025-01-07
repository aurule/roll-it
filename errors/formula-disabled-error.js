/**
 * Error class to throw in roll-formula when a disabled function is called
 */
class FormulaDisabledError extends Error {
  fnName

  constructor(fnName) {
    super(`Function ${fnName} is disabled`)
    this.fnName = fnName
  }
}

module.exports = {
  FormulaDisabledError,
}
