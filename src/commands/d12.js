import { PolyhedralCommand } from "./abstract/polyhedral-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the d12 command
 */
export class D12 extends PolyhedralCommand {
  static name = "d12"
  static sides = 12
}

registerCommand(D12)
