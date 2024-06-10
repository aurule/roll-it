const crypto = require("crypto")

module.exports = {
  /**
   * Return a checksum for a given value
   *
   * This uses md5 for speed. It is not cryptographic.
   *
   * @param  {string} value The value to make a checksum for
   * @return {string}       Checksum for the value, in hex format
   */
  checksum(value) {
    hasher = crypto.createHash("md5")

    return hasher.update(value).digest("hex")
  },
}
