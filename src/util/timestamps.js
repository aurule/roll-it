import { TimestampStyles, time } from "discord.js"

export function relativeTimestamp(utc_date) {
  return time(utc_date, TimestampStyles.RelativeTime)
}
