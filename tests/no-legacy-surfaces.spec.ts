import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(import.meta.dirname, '..')
const packageJsonPath = path.join(repoRoot, 'package.json')

const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const

const forbiddenPackages = [
  '@ai-swfactory/panoptic-guard',
  '@ai-swfactory/claude-factory',
  '@ai-swfactory/panoptic-build',
  '@ai-swfactory/panoptic-release',
  '@ai-swfactory/rollup-plugins',
] as const

const forbiddenToolCommands = ['panoptic-guard', 'panoptic-build', 'panoptic-release'] as const

const forbiddenPaths = ['.panoptic-project', '.github/workflows/ci-release.yml'] as const

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

describe('forbidden panoptic toolchain dependencies', () => {
  it('declares at least one dependency section, so the checks below are not vacuous', () => {
    expect(dependencyFields.flatMap(field => Object.keys(section(field))).length).toBeGreaterThan(0)
  })

  for (const field of dependencyFields) {
    for (const name of forbiddenPackages) {
      it(`does not list ${name} in ${field}`, () => {
        expect(Object.keys(section(field))).not.toContain(name)
      })
    }
  }
})

describe('the resolved dependency graph', () => {
  const lockfile = readFileSync(path.join(repoRoot, 'pnpm-lock.yaml'), 'utf8')

  it('is non-empty, so the checks below are not vacuous', () => {
    expect(lockfile.length).toBeGreaterThan(0)
  })

  for (const name of forbiddenPackages) {
    it(`resolves ${name} at no depth`, () => {
      expect(lockfile).not.toContain(`${name}@`)
    })
  }
})

describe('package scripts', () => {
  it('declares scripts, so the checks below are not vacuous', () => {
    expect(Object.keys(scripts()).length).toBeGreaterThan(0)
  })

  for (const command of forbiddenToolCommands) {
    it(`no script invokes ${command}`, () => {
      const offenders = Object.entries(scripts()).filter(
        ([, value]) => value === command || value.startsWith(`${command} `) || value.includes(` ${command} `),
      )
      expect(offenders).toEqual([])
    })
  }

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

describe('removed files stay removed', () => {
  it('the repository root exists, so the absence checks below are not vacuous', () => {
    expect(existsSync(packageJsonPath)).toBe(true)
  })

  for (const relativePath of forbiddenPaths) {
    it(`${relativePath} is absent`, () => {
      expect(existsSync(path.join(repoRoot, relativePath))).toBe(false)
    })
  }
})

describe('no packed tarball is committed', () => {
  const tracked = execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' }).split('\n').filter(Boolean)

  it('tracks files, so the check below is not vacuous', () => {
    expect(tracked.length).toBeGreaterThan(0)
  })

  // Both conditions matter: release staging packs an untracked .tgz into the
  // root, and guard validates a worktree whose index still names files the
  // pending commit deletes. Only a tarball that is tracked AND present is one
  // the repository actually carries.
  it('carries no .tgz that is both tracked and present', () => {
    const carried = tracked.filter(file => file.endsWith('.tgz')).filter(file => existsSync(path.join(repoRoot, file)))

    expect(carried).toEqual([])
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
