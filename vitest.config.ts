// DO NOT EDIT — generated from src/blueprints/vitest-config.ts; run `panoptic-guard commit` to refresh

import { nodePreset } from '@ai-swfactory/panoptic-presets/vitest'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(defineConfig(nodePreset()), defineConfig({ test: { exclude: ['tests/consumer/**'] } }))
