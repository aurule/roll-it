import { PolyhedralCommand } from "./abstract/polyhedral-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the d8 command
 */
export class D8 extends PolyhedralCommand {
  static name = "d8"
  static sides = 8
}

registerCommand(D8)
