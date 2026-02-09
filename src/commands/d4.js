import { PolyhedralCommand } from "./abstract/polyhedral-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the d4 command
 */
export class D4 extends PolyhedralCommand {
  static name = "d4"
  static sides = 4
}

registerCommand(D4)
