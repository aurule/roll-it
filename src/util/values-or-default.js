function valuesOrDefault(interaction, default_values) {
  if (interaction.values?.length > 0) return interaction.values
  return default_values
}

module.exports = {
  valuesOrDefault,
}
