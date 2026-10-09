import { describe, expect, it } from 'vitest'

const DIST_ENTRY = '../../dist/index.js'

const exportNames = (module: unknown): string[] => (typeof module === 'object' && module !== null ? Object.keys(module) : [])

describe('dist.consumer', () => {
  it('exports the lookup surface from the published entry point', async () => {
    const module: unknown = await import(DIST_ENTRY)

    expect(exportNames(module)).toEqual(expect.arrayContaining(['lookup', 'extension', 'contentType', 'charset']))
  })
})
