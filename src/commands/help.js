import { ParentCommand } from "./abstract/parent-command.js"
import { CommandHelp } from "./help/command.js"
import { Feedback } from "./help/feedback.js"
import { Topic } from "./help/topic.js"
import { sortedCommands } from "./index.js"
import { list as topicList } from "../presenters/topic-name-presenter.js"
import { list as commandList } from "../presenters/command-name-presenter.js"
import { registerCommand } from "./index.js"

/**
 * Class for the help family of commands
 */
export class Help extends ParentCommand {
  static name = "help"
  static global = true
  static children = [Topic, CommandHelp, Feedback]

  static help_data(opts) {
    return {
      topics: topicList(opts.locale),
      commands: commandList(sortedCommands(opts.locale).commands, opts.locale),
    }
  }
}

registerCommand(Help)
