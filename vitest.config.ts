// DO NOT EDIT — generated from src/blueprints/vitest-config.ts; run `panoptic-guard commit` to refresh

import { nodePreset } from '@ai-swfactory/panoptic-presets/vitest'
import { defineConfig, mergeConfig } from 'vitest/config'

// Consumer-owned extension layer (issue #506 Front 2; pg#711). This
// module is NOT generated or enforced by panoptic-guard — create
// `vitest.consumer.config.ts` in the project root and export a vitest
// config object (or `defineConfig(...)` result) with any project-specific
// layer, e.g.:
//
//   // vitest.consumer.config.ts
//   import { defineConfig } from 'vitest/config'
//   export default defineConfig({ test: { exclude: ['tests/consumer/**'] } })
//
// Its content survives every `panoptic-guard commit` re-enforcement
// because guard never owns this file. If you need no extra layer, export
// an empty config: `export default {}`. The import path matches the
// file name mandated by `required-files` (pg#711 — never inject an
// import of a file that does not exist).
import consumerConfig from './vitest.consumer.config'

export default mergeConfig(defineConfig(nodePreset()), defineConfig(consumerConfig))
