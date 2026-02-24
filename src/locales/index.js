import { join } from "node:path"
import i18next from "i18next"
import fs_backend from "i18next-fs-backend"

import * as own_formatters from "../util/formatters/i18n.js"

const __dirname = import.meta.dirname;

/**
 * Initialized i18next module
 * @type {i18next}
 */
i18next.use(fs_backend).init({
  debug: false,
  showSupportNotice: false,
  fallbackLng: {
    default: ["en"],
  },
  lng: "en-US",
  defaultLng: "en-US",
  supportedLngs: ["en-US", "en", "es-ES", "es"],
  initAsync: false,
  ns: ["translation", "commands", "opposed", "install", "help", "modals", "teamwork"],
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
export const available_locales = ["en-US", "es-ES"]
export const i18n = i18next
