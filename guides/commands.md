# Command Implementation Guide

This is a bare-bones guide to the elements of a command.

The command object looks like this:

```ts
{
    name: string;                       // "command-name"
    parent?: string;                    // "parent-name"
    description: string;                // "user visible description"
    type?: string;                      // "slash"
    policy?: Object|Array<Object>;      // ManagerPolicy
    global?: bool;                      // Whether the command is a global command or a guild command
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
}
```

The command_name attribute is populated by `CommandHelpPresenter.present()`.

## File Locations

Commands live in the `/commands` directory. Subcommands live in `/commands/<parent-name>`

## Error Handling

The `interactionCreate` event handler catches any errors and replies with a friendly message to the user. Commands only need to catch errors if there is some special logic to apply, and can otherwise raise them up the chain.
