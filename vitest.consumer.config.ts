import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vitest/config'

const distBuilt = fs.existsSync(path.resolve(import.meta.dirname, 'dist/index.js'))

export default defineConfig({
  test: distBuilt ? {} : { exclude: ['tests/consumer/**'] },
})
