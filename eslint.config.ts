// DO NOT EDIT — generated from src/application/blueprints/eslint-config.ts; run `claude-factory work commit --message "<your-message>"` to refresh

import { nodePreset } from '@ai-swfactory/panoptic-presets/eslint'

export default [
  ...nodePreset({
    rules: {
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': true }],
    },
  }),
  { linterOptions: { noInlineConfig: true } },
]
