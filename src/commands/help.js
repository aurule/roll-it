import { ParentCommand } from "./abstract/parent-command.js"
import { CommandHelp } from "./help/command.js"
import { Feedback } from "./help/feedback.js"
import { Topic } from "./help/topic.js"

export class Help extends ParentCommand {
  static name = "help"
  static children = [Topic, CommandHelp, Feedback]
}
