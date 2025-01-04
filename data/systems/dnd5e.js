module.exports = {
  name: "dnd5e",
  title: "Dungeons & Dragons",
  description: "Suitable for all versions, includes advantage for 5e",
  notes: "Supports rolling d20s with advantage or disadvantage.",
  commands: {
    required: ["d20"],
    recommended: ["roll-formula", "d100", "d6"],
    optional: ["curv", "table"],
  },
}
