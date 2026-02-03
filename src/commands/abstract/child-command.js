/**
 * Mixin to convert a command to a subcommand
 *
 * This adds the parent static property and changes the builder getter to provide a subcommand builder.
 *
 * @param  {Command} kommand     Command class to modify
 * @param  {string}  parent_name Name of the parent command
 * @return {Command}             New subcommand class
 */
export function Child(kommand, parent_name) {
  return class extends kommand {
    static parent = parent_name

    /**
     * Get a command builder using our name
     * @return {LocalizedSubcommandBuilder} Builder object
     */
    static get builder() {
      return new LocalizedSubcommandBuilder(this.name, this.parent)
    }
  }
}
