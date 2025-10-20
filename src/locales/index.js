const { join } = require("node:path")
const i18next = require("i18next")
const fs_backend = require("i18next-fs-backend")

const own_formatters = require("../util/formatters/i18n")

i18next.use(fs_backend).init({
  debug: false,
  fallbackLng: {
    default: ["en"],
  },
  lng: "en-US",
  defaultLng: "en-US",
  supportedLngs: ["en-US", "en"],
  initAsync: false,
  ns: ["translation", "commands", "opposed", "help", "modals", "interactive", "teamwork"],
  backend: {
    loadPath: join(__dirname, "./{{lng}}/{{ns}}.yaml"),
    addPath: join(__dirname, "./{{lng}}/{{ns}}.missing.yaml"),
  },
  interpolation: {
    escapeValue: false,
  },
})

for (const [key, fn] of Object.entries(own_formatters)) {
  i18next.services.formatter.add(key, fn)
}

/**
 * List of discord-specific locales that have translations
 * @see https://discord.com/developers/docs/reference#locales
 * @type {str[]}
 */
const available_locales = ["en-US"]

module.exports = {
  /**
   * Initialized i18next module
   * @type {i18next}
   */
  i18n: i18next,
  available_locales,
}
