# Command Implementation Guide

This is a bare-bones guide to the elements of a command.

The command object looks like this:

```ts
{
    name: string;                       // "command-name"
    parent?: string;                    // "parent-name"
    replacement?: string;               // "other-command-name"
    description: string;                // "user visible description"
    type?: string;                      // "slash"
    policy?: Object|Array<Object>;      // ManagerPolicy
    global?: bool;                      // Whether the command is a global command or a guild command
    hidden?: bool;                      // Whether it's hidden from the rest of the UI
    subcommands?: Collection<Object>;   // Collection of subcommand objects
    data(options?): Builder;            // SlashCommandBuilder
    savable?: boolean;                  // Whether this command can be saved
    changeable?: Array<string>;         // List of options that can accept a numeric bonus, for use with saved rolls
    schema: Joi.object;                 // Validation object for options
    perform(Object): string;            // Take in options, return a string
    async execute(interaction): Promise;// Respond to an interaction
    async autocomplete?: Array<Object>; // () => [{name: "chop", value: "chop"}]
    help(options): string;              // "my very long help text"
}
```

(format is written in typescript, even though the bot uses javascript)

Requirements:

* The `name` *must* be the same as used in the builder.setName() call within `data`
* The `parent` field is required for subcommands. It must be the same as the parent command's `name`.
* The `replacement` field indicates that this command is being replaced by the named command. Must be the name of a top-level command, not a subcommand.
    - removes the current command from the choosable commands to deploy
    - causes the replacement command to be deployed to all servers that have the current command
* The `description` should be the same as used in the builder.setDescription() call
* `type` is optional and describes the type of command: "menu" or "slash". `Undefined` is interpreted as `"slash"`.
* `policy` is optional and contains a policy object (or array of them) for allowing access to the command. `Undefined` allows all users. This is mostly superceded by Discord's `setDefaultMemberPermissions()` method on the command builder.
* `data` must return an instance of a discordjs command builder, or subcommand builder for subcommands
* `autocomplete` must be present if any options are marked with `.setAutocomplete(true)`. It must return a correct list of autocomplete suggestions based on the partial focused option's name and value
* `execute` should return `interaction.reply()` or similar
* `help` receives an options object with the attributes below
* `help` must return a string

Help options object:

```ts
{
    command_name: string, // "/formatted-command-name"
    option1: string,
    option2: string,
}
```

The `command_name` attribute is populated by `CommandHelpPresenter.present()`. Other attributes are named the same as command args, and contain the formatted name of that argument.

## File Locations

Commands live in the `/commands` directory. Subcommands live in `/commands/<parent-name>`

## Error Handling

The `interactionCreate` event handler catches any errors and replies with a friendly message to the user. Commands only need to catch errors if there is some special logic to apply, and can otherwise raise them up the chain.

## Deprecation

If a command is to be replaced by a newer one:

1. Add the `replacement` attribute to the old command
    - for guild commands, this prevents the command from appearing in the command chooser and ensures the replacement is deployed to servers using the old command
    - for global commands, this has no immediate effect
2. Deploy at least once for guild commands.
3. Add a deprecation notice to the output of the old command.
4. Convert the old command to actually call the new one, if it makes sense
5. Remove the old command

If a command is to be removed without replacement:

1. Add a removal notice to the output of the command
2. Wait a *while*
3. Remove the old command
