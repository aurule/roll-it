import { PolyhedralCommand } from "./abstract/polyhedral-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the d6 command
 */
export class D6 extends PolyhedralCommand {
  static name = "d6"
  static sides = 6
}

registerCommand(D6)
