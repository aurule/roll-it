import { PolyhedralCommand } from "./abstract/polyhedral-command.js"

/**
 * Class for the d10 command
 */
export class D10 extends PolyhedralCommand {
  static name = "d10"
  static sides = 10
}
