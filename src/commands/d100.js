import { PolyhedralCommand } from "./abstract/polyhedral-command.js"

/**
 * Class for the d100 command
 */
export class D100 extends PolyhedralCommand {
  static name = "d100"
  static sides = 100
}
