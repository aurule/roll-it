module.exports = {
  name: "generic",
  title: "Generic dice",
  description: "Suitable for games without fancy dice rules",
  notes: "Supports most game systems that don't have special tallying rules.",
  commands: {
    required: ["d6", "d10", "d20", "d100", "roll-formula"],
    optional: ["table"],
  },
}
