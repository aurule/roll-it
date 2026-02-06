import { ParentCommand } from "./abstract/parent-command.js"
import { CommandHelp } from "./help/command.js"
import { Feedback } from "./help/feedback.js"
import { Topic } from "./help/topic.js"
import { commands } from "./index.js"
import { list as topicList } from "../presenters/topic-name-presenter.js"
import { list as commandList } from "../presenters/command-name-presenter.js"

export class Help extends ParentCommand {
  static name = "help"
  static children = [Topic, CommandHelp, Feedback]

  static help_data(opts) {
    return {
      topics: topicList(opts.locale),
      commands: commandList(commands.sorted.get(opts.locale), opts.locale),
    }
  }
}
