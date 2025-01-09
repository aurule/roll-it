const { join } = require("node:path")
const i18next = require("i18next")
const Backend = require("i18next-fs-backend")

i18next.use(Backend).init({
  debug: process.env.NODE_ENV === "development",
  fallbackLng: {
    default: ["en-US"],
  },
  lng: "en-US",
  defaultLng: "en-US",
  supportedLngs: ["en-US", "en"],
  initAsync: false,
  ns: ["translation", "commands", "teamwork", "opposed"],
  backend: {
    loadPath: join(__dirname, "./{{lng}}/{{ns}}.yaml"),
    addPath: join(__dirname, "./{{lng}}/{{ns}}.missing.yaml"),
  },
  interpolation: {
    escapeValue: false,
  },
})

module.exports = {
  i18n: i18next,
}
