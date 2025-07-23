/**
 * Test whether a bitfield contains the given flag
 *
 * @param  {bytes} bitfield The bitfield to test
 * @param  {bit}   flag     The expected flag
 * @return {object}         Jest results object
 */
function toHaveFlag(bitfield, flag) {
  const hint_options = {
    comment: "(bitfield & flag) !== 0",
    isNot: this.isNot,
    promise: this.promise,
  }

  this.utils.ensureNumbers(bitfield, flag, "toHaveFlag", hint_options)

  const pass = (bitfield & flag) !== 0

  const bitfield_str = bitfield.toString(16)
  const flag_str = flag.toString(16)
  const len = Math.max(bitfield_str.length, flag_str.length)

  const pretty_bitfield = `0x${bitfield_str.padStart(len, "0")}`
  const pretty_flag = `0x${flag_str.padStart(len, "0")}`

  const message = pass
    ? () =>
      this.utils.matcherHint('toHaveFlag', undefined, undefined, hint_options) +
      "\n\n" +
      `Expected: not ${this.utils.printExpected(pretty_flag)}\n` +
      `Received: ${this.utils.printReceived(pretty_bitfield)}`
    : () =>
      this.utils.matcherHint('toHaveFlag', undefined, undefined, hint_options) +
      "\n\n" +
      `Expected: ${this.utils.printExpected(pretty_flag)}\n` +
      `Received: ${this.utils.printReceived(pretty_bitfield)}`

  return { actual: bitfield, message, pass }
}

module.exports = {
  toHaveFlag,
}
