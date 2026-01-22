const { Installation } = require("../../db/installation")
import { i18n } from "../../locales/index.js"
const build = require("../../util/message-builders")

/**
 * Message shown upon cancelling an install process
 */
module.exports = {
  name: "cancelled",
  data: (installation_id) => {
    const install_db = new Installation()
    const install = install_db.getInstallation(installation_id)
    const locale = install.locale

    const t = i18n.getFixedT(locale, "install")

    return build.textMessage(t("cancelled"))
  },
}
