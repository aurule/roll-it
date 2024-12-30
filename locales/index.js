const { join } = require('node:path')
const i18next = require("i18next")
const Backend = require("i18next-fs-backend")

i18next
  .use(Backend)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    defaultLng: 'en',
    lowerCaseLng: true,
    supportedLngs: ['en'],
    nonExplicitSupportedLngs: true,
    initAsync: false,
    backend: {
      loadPath: join(__dirname, './{{lng}}/{{ns}}.json'),
      addPath: join(__dirname, './{{lng}}/{{ns}}.missing.json'),
    },
    interpolation: {
      escapeValue: false,
    },
  })

module.exports = {
  i18n: i18next,
  t: i18next.t,
}
