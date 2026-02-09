import { ParentCommand } from "./abstract/parent-command.js"
import { Opposed } from "./met/opposed.js"
import { MetStatic } from "./met/static.js"
import { registerCommand } from "./index.js"

/**
 * Class for the met parent command
 */
export class Met extends ParentCommand {
  static name = "met"
  static children = [MetStatic, Opposed]
}

registerCommand(Met)
