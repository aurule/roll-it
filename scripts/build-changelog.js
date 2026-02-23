import { promises as fs } from "node:fs"
import path from "node:path"

import changes from "../changes/index.js"
import package_data from "../package.json" with { type: "json" }

const __dirname = meta.import.dirname

function buildSection(bucket) {
  return bucket.map((item) => `* ${item}`).join("\n")
}
;(async () => {
  const lines = [`# Changelog for Roll It v${package_data.version}`]

  if (changes.added.length) {
    lines.push("")
    lines.push("## Added")
    lines.push("")
    lines.push(buildSection(changes.added))
  }

  if (changes.changed.length) {
    lines.push("")
    lines.push("## Changed")
    lines.push("")
    lines.push(buildSection(changes.changed))
  }

  if (changes.removed.length) {
    lines.push("")
    lines.push("## Removed")
    lines.push("")
    lines.push(buildSection(changes.removed))
  }

  if (changes.fixed.length) {
    lines.push("")
    lines.push("## Fixed")
    lines.push("")
    lines.push(buildSection(changes.fixed))
  }

  lines.push("") // end with a newline

  const text = lines.join("\n")

  await fs.writeFile(path.join(__dirname, "../changelog", `${package_data.version}.md`), text)
  await fs.writeFile(path.join(__dirname, "../src", `changes.js`), `export default \`${text.replace("`", '\`')}\``)

  for (const file of changes.files) {
    fs.rm(file)
  }
})()
