import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(import.meta.dirname, '..')
const packageJsonPath = path.join(repoRoot, 'package.json')

const docFiles = ['README.md', 'CLAUDE.md'] as const

const pnpmBuiltins = new Set(['add', 'install', 'remove', 'exec', 'dlx', 'pack', 'publish', 'why', 'update', 'store'])

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

// Only fenced blocks and inline code spans are instructions to run something;
// `pnpm` in running prose is a noun, not a command.
const codeSnippets = (markdown: string): string[] => [
  ...[...markdown.matchAll(/```[^\n]*\n([\s\S]*?)```/gu)].flatMap(m => (m[1] ?? '').split('\n')),
  ...[...markdown.matchAll(/`([^`\n]+)`/gu)].map(m => m[1] ?? ''),
]

const packageJson: unknown = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

const section = (field: string): Record<string, unknown> => {
  if (!isRecord(packageJson)) return {}
  const value = packageJson[field]
  return isRecord(value) ? value : {}
}

const scripts = (): Record<string, string> =>
  Object.fromEntries(Object.entries(section('scripts')).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))

describe('package scripts', () => {
  it('declares scripts, so the checks below are not vacuous', () => {
    expect(Object.keys(scripts()).length).toBeGreaterThan(0)
  })

  it('every script a doc tells the reader to run exists in package.json#scripts', () => {
    const declared = new Set(Object.keys(scripts()))
    const missing: string[] = []
    let scanned = 0

    for (const doc of docFiles) {
      const docPath = path.join(repoRoot, doc)
      if (!existsSync(docPath)) continue
      scanned += 1
      for (const snippet of codeSnippets(readFileSync(docPath, 'utf8'))) {
        for (const match of snippet.matchAll(/(?:^|&&|\|\||;)\s*pnpm(?: run)? ([\w:-]+)/gu)) {
          const name = match[1]
          if (name === undefined || pnpmBuiltins.has(name)) continue
          if (!declared.has(name)) missing.push(`${doc}: pnpm ${name}`)
        }
      }
    }

    expect(scanned).toBeGreaterThan(0)
    expect(missing).toEqual([])
  })
})

describe('published files exist', () => {
  for (const promised of ['LICENSE', 'README.md']) {
    it(`ships the ${promised} its files list promises`, () => {
      expect(Object.values(section('files'))).toContain(promised)
      expect(existsSync(path.join(repoRoot, promised))).toBe(true)
    })
  }

  it('declares a license field', () => {
    expect(isRecord(packageJson) ? packageJson.license : undefined).toBe('MIT')
  })
})
