const { inlineCode } = require("discord.js")

/**
 * Present the details of a single saved roll
 *
 * @param  {obj} saved_roll Saved roll details
 * @return {str}            String describing all attributes of the saved roll
 */
function present(saved_roll, t) {
  const name = saved_roll.name ?? t("entry.details.missing.name")
  const description = saved_roll.description ?? t("entry.details.missing.description")
  const command = saved_roll.command ?? t("entry.details.missing.command")

  let options_body
  if (saved_roll.options) {
    const opts_list = []
    for (const opt in saved_roll.options) {
      opts_list.push(t("entry.details.option", { name: opt, value: saved_roll.options[opt] }))
    }
    options_body = opts_list
  } else {
    options_body = [t("entry.missing.options")]
  }

  const opt_key = saved_roll.invalid
    ? "entry.details.options.invalid"
    : "entry.details.options.valid"
  const options = t(opt_key, { options: options_body })

  let invocation
  if (saved_roll.command) {
    invocation = presentInvocation(saved_roll)
  } else {
    invocation = t("entry.details.missing.invocation")
  }

  const t_args = {
    name,
    description,
    command,
    options,
    invocation,
  }
  const body = t("entry.details.body", t_args)

  if (saved_roll.incomplete) {
    return t("entry.details.incomplete", { body })
  }
  return body
}

/**
 * Present the list of available saved rolls
 *
 * @param  {obj[]} rolls Array of saved_roll info objects
 * @return {str}         String with the saved roll list
 */
function presentList(saved_rolls, t) {
  if (!saved_rolls.length) {
    return t("entry.list.empty")
  }

  const rolls = saved_rolls.map((roll) => {
    const name = roll.name ?? t("entry.list.missing.name")
    const description = roll.description ?? t("entry.list.missing.description")
    let invocation
    if (roll.command) {
      invocation = presentInvocation(roll)
    } else {
      invocation = t("entry.list.missing.invocation")
    }

    const roll_args = {
      name,
      description,
      invocation,
    }

    let roll_key
    if (roll.invalid && roll.incomplete) {
      roll_key = "entry.list.record.borked"
    } else if (roll.invalid) {
      roll_key = "entry.list.record.invalid"
    } else if (roll.incomplete) {
      roll_key = "entry.list.record.incomplete"
    } else {
      roll_key = "entry.list.record.ready"
    }
    return t(roll_key, roll_args)
  })

  const t_args = {
    count: saved_rolls.length,
    rolls,
  }

  return t("entry.list.filled", t_args)
}

/**
 * Present a saved roll's command invocation
 *
 * This string is meant to be usable by pasting it directly into discord's chat.
 *
 * @param  {obj} saved_roll Saved roll info object
 * @return {str}            Invocation string
 */
function presentInvocation(saved_roll) {
  const command_name = saved_roll.command ?? ""
  const options = saved_roll.options ?? {}

  let content_lines = "/" + command_name
  for (const opt in options) {
    content_lines += ` ${opt}:${options[opt]}`
  }

  return inlineCode(content_lines)
}

module.exports = {
  present,
  presentList,
  presentInvocation,
}
