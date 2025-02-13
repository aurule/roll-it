const progress = require("cli-progress")

const { GlobalSavedRolls } = require("../src/db/saved_rolls")
const commands = require("../src/commands")
const { logger } = require("../src/util/logger")

logger.level = "warn"

const saved_rolls = new GlobalSavedRolls()
const all_rolls = saved_rolls.all()

const bar = new progress.SingleBar({
  hideCursor: true,
  stopOnComplete: true,
})

process.stdout.write("Validating all saved rolls...\n")
bar.start(all_rolls.length, 0)

for (const roll_detail of all_rolls) {
  const command = commands.get(roll_detail.command)

  const validation_result = command.schema?.validate(roll_detail.options)
  if (validation_result?.error) {
    console.log(`bad roll`)
    saved_rolls.update(roll_detail.id, { invalid: true })
  }

  if (!validation_result) {
    console.log(`so that's weird`)
    saved_rolls.update(roll_detail.id, { invalid: true })
  }

  bar.increment()
}
