import { ParentCommand } from "./abstract/parent-command.js"
import { Attack } from "./dnd/attack.js"
import { FullAttack } from "./dnd/full-attack.js"
import { Save } from "./dnd/save.js"
import { Skill } from "./dnd/skill.js"

/**
 * Class for the dnd parent command
 */
export class Dnd extends ParentCommand {
  static name = "dnd"
  static children = [Attack, FullAttack, Save, Skill]
}
