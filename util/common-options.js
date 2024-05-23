/**
 * Callbacks for common shared command options.
 */

module.exports = {
    /**
     * Description option
     *
     * @param  {SlashCommandStringOption} option Option to populate
     * @return {SlashCommandStringOption}        Populated option
     */
    description(option) {
        return option
        .setName("description")
        .setDescription("A word or two about this roll")
    },

    /**
     * Rolls option
     *
     * @param  {SlashCommandIntegerOption} option Option to populate
     * @return {SlashCommandIntegerOption}        Populated option
     */
    rolls(option) {
        return option
        .setName("rolls")
        .setDescription("Roll this many times (default 1)")
        .setMinValue(1)
    },

    /**
     * Secret option
     *
     * @param  {SlashCommandBooleanOption} option Option to populate
     * @return {SlashCommandBooleanOption}        Populated option
     */
    secret(option) {
        return option
        .setName("secret")
        .setDescription("Hide the results from everyone but you")
    },
}
