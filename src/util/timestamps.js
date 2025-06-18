const { TimestampStyles, time } = require("discord.js")

function relativeTimestamp(utc_date) {
  return time(utc_date, TimestampStyles.RelativeTime)
}

module.exports = {
  relativeTimestamp,
}
