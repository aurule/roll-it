import { Collection } from "discord.js"
import { ChangeInstalledModal } from "./change-installed.js"
import { ReportRollModal } from "./report-roll.js"
import { SavedRollModal } from "./saved-roll.js"

/**
 * Collection of Modal objects
 * @type Collection<Modal>
 */
export const modals = new Collection()

/**
 * Register a modal class
 * @param  {Modal} modalKlass Modal class to register
 */
function register(modalKlass) {
  modals.set(modalKlass.name, modalKlass)
}

register(ChangeInstalledModal)
register(ReportRollModal)
register(SavedRollModal)
