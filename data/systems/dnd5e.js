module.exports = {
  name: "dnd5e",
  title: "Dungeons & Dragons 5e",
  notes: "Supports rolling d20s with advantage or disadvantage.",
  commands: {
    required: ["d20"],
    recommended: ["roll-formula", "d100"],
    optional: ["curv"],
  },
}
