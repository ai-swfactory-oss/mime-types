# @ai-swfactory-oss/mime-types

TypeScript MIME type database and utilities with full type inference.

## Installation

The package is published to GitHub Packages, which needs two things even for public packages.

1. The scope line, in your project's `.npmrc` (safe to commit):

   ```
   @ai-swfactory-oss:registry=https://npm.pkg.github.com
   ```

2. A token with `read:packages` (a classic personal access token), in your **user** `~/.npmrc`, never in the repository:

   ```
   //npm.pkg.github.com/:_authToken=<token>
   ```

   In GitHub Actions, use `actions/setup-node` with `registry-url: https://npm.pkg.github.com`, `scope: "@ai-swfactory-oss"` and `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`, and grant the job `packages: read`.

Then:

```bash
pnpm add @ai-swfactory-oss/mime-types
```

## Usage

```typescript
import { lookup, extension, contentType, charset, types, extensions } from '@ai-swfactory-oss/mime-types'

// Lookup MIME type by extension
lookup('json') // => 'application/json'
lookup('html') // => 'text/html'
lookup('unknown') // => false

// Lookup MIME type by file path
lookup('path/to/file.png') // => 'image/png'

// Get extension for MIME type
extension('application/json') // => 'json'
extension('text/html') // => 'html'

// Create Content-Type header
contentType('html') // => 'text/html; charset=utf-8'
contentType('text/plain') // => 'text/plain; charset=utf-8'
contentType('image/png') // => 'image/png'

// Get charset for MIME type
charset('text/html') // => 'UTF-8'
charset('application/json') // => 'UTF-8'
charset('image/png') // => false

// Access raw mappings
types.json // => 'application/json'
extensions['image/png'] // => ['png']
```

## Type Safety

All return types are fully typed with literal unions:

```typescript
import type { MimeType, Extension, Charset } from '@ai-swfactory-oss/mime-types'

// MimeType is a union of all known MIME types
const mime: MimeType = 'application/json'

// Extension is a union of all known extensions
const ext: Extension = 'json'

// Charset is a union of all known charsets
const cs: Charset = 'UTF-8'
```

## API

### `lookup(path: unknown): MimeType | false`

Get the MIME type for a file path or extension.

### `extension(type: unknown): Extension | false`

Get the default extension for a MIME type.

### `contentType(str: unknown): string | false`

Create a full Content-Type header value for a MIME type or extension.

### `charset(type: unknown): Charset | 'UTF-8' | false`

Get the default charset for a MIME type.

### `types: Record<Extension, MimeType>`

Map of extensions to MIME types.

### `extensions: Record<MimeType, Extension[]>`

Map of MIME types to extensions.

### `charsets.lookup(type: unknown)`

Alias for `charset()`.

## License

MIT
