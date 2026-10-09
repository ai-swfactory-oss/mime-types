import { type Charset, db, type Extension, type MimeType, type Source } from './db'

export type { Charset, Extension, MimeType, Source }
export type { MimeData } from './db'

const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/
const TEXT_TYPE_REGEXP = /^text\//i

const mimeTypes: Partial<Record<Extension, MimeType>> = {}
const mimeExtensions: Partial<Record<MimeType, readonly Extension[]>> = {}

const isMimeType = (key: string): key is MimeType => key in db

const isExtension = (key: string): key is Extension => key.length > 0

const populateMaps = (
  extensionsMap: Partial<Record<MimeType, readonly Extension[]>>,
  typesMap: Partial<Record<Extension, MimeType>>,
  database: typeof db,
): void => {
  const preference: (Source | undefined)[] = ['nginx', 'apache', undefined, 'iana']

  for (const key of Object.keys(database)) {
    if (!isMimeType(key)) {
      continue
    }
    const type = key
    const mime = database[type]

    if (!('extensions' in mime)) {
      continue
    }

    if (mime.extensions.length <= 0) {
      continue
    }

    const exts = mime.extensions

    extensionsMap[type] = exts

    for (const extension of exts) {
      const currentMime = typesMap[extension]
      if (currentMime) {
        const currentMimeData = database[currentMime]
        const currentSource = 'source' in currentMimeData ? currentMimeData.source : undefined
        const newSource = 'source' in mime ? mime.source : undefined

        const from = preference.indexOf(currentSource)
        const to = preference.indexOf(newSource)

        if (currentMime !== 'application/octet-stream' && (from > to || (from === to && currentMime.startsWith('application/')))) {
          continue
        }
      }

      typesMap[extension] = type
    }
  }
}

populateMaps(mimeExtensions, mimeTypes, db)

export const lookup = (path: unknown): MimeType | false => {
  if (!path || typeof path !== 'string') {
    return false
  }

  const filename = 'x.' + path
  const lastDotIndex = filename.lastIndexOf('.')
  const potentialExtension = lastDotIndex < 1 ? '' : filename.substring(lastDotIndex + 1).toLowerCase()

  if (!potentialExtension || !isExtension(potentialExtension)) {
    return false
  }

  return mimeTypes[potentialExtension] ?? false
}

export const charset = (type: unknown): Charset | 'UTF-8' | false => {
  if (!type || typeof type !== 'string') {
    return false
  }

  const match = EXTRACT_TYPE_REGEXP.exec(type)
  const mimeKey = match?.[1]?.toLowerCase()

  if (!mimeKey) {
    return false
  }

  if (!isMimeType(mimeKey)) {
    if (TEXT_TYPE_REGEXP.test(mimeKey)) {
      return 'UTF-8'
    }
    return false
  }

  const mimeData = db[mimeKey]

  if ('charset' in mimeData) {
    return mimeData.charset
  }

  if (TEXT_TYPE_REGEXP.test(mimeKey)) {
    return 'UTF-8'
  }

  return false
}

export const contentType = (str: unknown): string | false => {
  if (!str || typeof str !== 'string') {
    return false
  }

  let mime: string | false = str.includes('/') ? str : lookup(str)

  if (!mime) {
    return false
  }

  if (!mime.includes('charset')) {
    const cs = charset(mime)
    if (cs) {
      const charsetString = cs.toLowerCase()
      mime += '; charset=' + charsetString
    }
  }

  return mime
}

export const extension = (type: unknown): Extension | false => {
  if (!type || typeof type !== 'string') {
    return false
  }

  const match = EXTRACT_TYPE_REGEXP.exec(type)
  const mimeKey = match?.[1]?.toLowerCase()

  if (!mimeKey || !isMimeType(mimeKey)) {
    return false
  }

  const exts = mimeExtensions[mimeKey]

  if (exts && exts.length > 0) {
    const firstExt = exts[0]
    return firstExt ?? false
  }

  return false
}

export const types: Readonly<Partial<Record<Extension, MimeType>>> = mimeTypes

export const extensions: Readonly<Partial<Record<MimeType, readonly Extension[]>>> = mimeExtensions

export const charsets: { lookup: typeof charset } = { lookup: charset }
