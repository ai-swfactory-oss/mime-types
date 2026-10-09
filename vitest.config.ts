// DO NOT EDIT — generated from src/domain/blueprints/vitest-config.ts; run `claude-factory work commit --message "<your-message>"` to refresh

import { nodePreset } from '@ai-swfactory/panoptic-presets/vitest'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(defineConfig(nodePreset()), defineConfig({ test: { exclude: ['tests/consumer/**'] } }))
