import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vitest/config'

// dist/ is not produced by `pnpm install`, so the consumer tests only run once
// it exists; without it they are excluded rather than failing.
const distBuilt = fs.existsSync(path.resolve(import.meta.dirname, 'dist/index.js'))

export default defineConfig({
  test: distBuilt ? {} : { exclude: ['tests/consumer/**'] },
})
