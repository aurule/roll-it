/**
 * Get the values of a selection input, or return the given defaults
 *
 * @param  {Interaction} interaction    Discord interaction
 * @param  {Array}       default_values Array of default values to fall back on
 * @return {Array}                      Array of user values or defaults
 */
function valuesOrDefault(interaction, default_values) {
  if (interaction.values?.length > 0) return interaction.values
  return default_values
}

module.exports = {
  valuesOrDefault,
}
