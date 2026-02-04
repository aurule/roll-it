import { ParentCommand } from "./abstract/parent-command.js"
import { List } from "./table/list.js"
import { Manage } from "./table/manage.js"
import { Roll } from "./table/roll.js"
import { Add } from "./table/add.js"

/**
 * Class for the table commands
 */
export class Table extends ParentCommand {
  static name = "table"
  static children = [Roll, List, Add, Manage]
}
