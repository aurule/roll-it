import { PolyhedralCommand } from "./abstract/polyhedral-command.js"

/**
 * Class for the d8 command
 */
export class D8 extends PolyhedralCommand {
  static name = "d8"
  static sides = 8
}
