import { Installation } from "../../db/installation.js"
import { i18n } from "../../locales/index.js"
import build from "../../util/message-builders.js"

/**
 * Create the message shown upon cancelling an install process
 * @param  {number}         installation_id Internal ID of the installation record
 * @return {MessageBuilder}                 Message data object
 */
export function messageData(installation_id) {
  const install_db = new Installation()
  const install = install_db.getInstallation(installation_id)
  const locale = install.locale

  const t = i18n.getFixedT(locale, "install")

  return build.textMessage(t("cancelled"))
}
