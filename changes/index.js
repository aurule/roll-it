import fs from "node:fs"
import path from "node:path"

import { noTests, noDotFiles } from "../src/util/filters.js"

const basename = path.basename(__filename)
const buckets = {
  added: [],
  changed: [],
  removed: [],
  fixed: [],
  files: [],
}

fs.readdirSync(__dirname)
  .filter(noTests)
  .filter(noDotFiles)
  .filter((file) => file !== basename)
  .forEach((file) => {
    const bucket_name = path.extname(file).substring(1)
    const file_path = path.join(__dirname, file)
    const contents = fs.readFileSync(file_path, "utf-8")
    buckets[bucket_name].push(contents.trim())
    buckets.files.push(file_path)
  })

export default buckets
