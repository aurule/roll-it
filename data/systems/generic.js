module.exports = {
  name: "generic",
  title: "Generic dice",
  notes: "Supports most game systems that don't have special tallying rules.",
  commands: {
    required: ["d10", "d20", "d100", "roll-formula"],
    optional: ["table"],
  },
}
