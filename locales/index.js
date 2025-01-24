const { join } = require("node:path")
const i18next = require("i18next")
const Backend = require("i18next-fs-backend")
const { unorderedList } = require("discord.js")

i18next.use(Backend).init({
  debug: process.env.NODE_ENV === "development",
  fallbackLng: {
    default: ["en-US"],
  },
  lng: "en-US",
  defaultLng: "en-US",
  supportedLngs: ["en-US", "en"],
  initAsync: false,
  ns: ["translation", "commands", "teamwork", "opposed", "help"],
  backend: {
    loadPath: join(__dirname, "./{{lng}}/{{ns}}.yaml"),
    addPath: join(__dirname, "./{{lng}}/{{ns}}.missing.yaml"),
  },
  interpolation: {
    escapeValue: false,
  },
})

i18next.services.formatter.add("ul", (value, lng, options) => {
  return unorderedList(value)
})

i18next.services.formatter.add("ol", (value, lng, options) => {
  return value.map((val, idx) => `${idx+1}. ${val}`).join("\n")
})

i18next.services.formatter.add("indented", (value, lng, options) => {
  return "\t" + value.join("\n\t")
})

/**
 * List of discord-specific locales that have translations
 * @see https://discord.com/developers/docs/reference#locales
 * @type {Array}
 */
const available_locales = ["en-US"]

module.exports = {
  i18n: i18next,
  available_locales,
}
