import { describe, expect, it } from 'vitest'

import { charset, contentType, extension, extensions, lookup, types } from '../src/index'

const CLAIMED_BY_SEVERAL_TYPES = [
  ['3gpp', 'video/3gpp'],
  ['aac', 'audio/aac'],
  ['ac', 'application/pkix-attr-cert'],
  ['asc', 'application/pgp-keys'],
  ['bdoc', 'application/bdoc'],
  ['bmp', 'image/bmp'],
  ['deb', 'application/x-debian-package'],
  ['dll', 'application/x-msdownload'],
  ['dmg', 'application/x-apple-diskimage'],
  ['emf', 'image/emf'],
  ['exe', 'application/x-msdos-program'],
  ['fdf', 'application/fdf'],
  ['ico', 'image/vnd.microsoft.icon'],
  ['iso', 'application/x-iso9660-image'],
  ['jpgm', 'image/jpm'],
  ['jpm', 'image/jpm'],
  ['js', 'text/javascript'],
  ['key', 'application/vnd.apple.keynote'],
  ['m4a', 'audio/mp4'],
  ['mp3', 'audio/mpeg'],
  ['mp4', 'application/mp4'],
  ['mpg4', 'application/mp4'],
  ['mpp', 'application/dash-patch+xml'],
  ['msi', 'application/x-msdownload'],
  ['mts', 'video/mp2t'],
  ['numbers', 'application/vnd.apple.numbers'],
  ['obj', 'model/obj'],
  ['org', 'application/vnd.lotus-organizer'],
  ['pages', 'application/vnd.apple.pages'],
  ['pcx', 'image/vnd.zbrush.pcx'],
  ['pdb', 'application/vnd.palm'],
  ['prc', 'model/prc'],
  ['ra', 'audio/x-pn-realaudio'],
  ['rar', 'application/vnd.rar'],
  ['rtf', 'application/rtf'],
  ['sql', 'application/sql'],
  ['stl', 'model/stl'],
  ['sub', 'text/vnd.dvb.subtitle'],
  ['wav', 'audio/wave'],
  ['wmf', 'image/wmf'],
  ['wmz', 'application/x-ms-wmz'],
  ['x3db', 'model/x3d+fastinfoset'],
  ['x3dv', 'model/x3d-vrml'],
  ['xfdf', 'application/xfdf'],
  ['xlf', 'application/xliff+xml'],
  ['xml', 'application/xml'],
  ['xsl', 'application/xml'],
]

const typesByExtension = new Map<string, string>(Object.entries(types))
const extensionsByType = new Map<string, readonly string[]>(Object.entries(extensions))

describe('lookups return the same results as before', () => {
  it.each(CLAIMED_BY_SEVERAL_TYPES)(
    'lookup gives an extension several types claim, %s, the type the source preference picks',
    (ext, type) => {
      expect(lookup(ext)).toBe(type)
    },
  )

  it.each(CLAIMED_BY_SEVERAL_TYPES)(
    'the types map gives an extension several types claim, %s, the type the source preference picks',
    (ext, type) => {
      expect(typesByExtension.get(ext)).toBe(type)
    },
  )

  it('the types map holds one entry per extension and the extensions map one entry per type that declares extensions', () => {
    expect([typesByExtension.size, extensionsByType.size]).toEqual([1208, 993])
  })

  it.each([
    ['application/octet-stream', 'bin'],
    ['application/x-msdownload', 'exe'],
    ['audio/wave', 'wav'],
    ['video/mp4', 'mp4'],
    ['application/xml', 'xml'],
  ])('extension gives %s its first declared extension', (type, ext) => {
    expect(extension(type)).toBe(ext)
  })

  it.each([
    { type: 'application/x-msdownload', declared: ['exe', 'dll', 'com', 'bat', 'msi'] },
    { type: 'application/mp4', declared: ['mp4', 'mpg4', 'mp4s', 'm4p'] },
    { type: 'application/xml', declared: ['xml', 'xsl', 'xsd', 'rng'] },
  ])('the extensions map gives $type every extension it declares, in order', ({ type, declared }) => {
    expect(extensionsByType.get(type)).toEqual(declared)
  })

  it.each([
    ['js', 'text/javascript; charset=utf-8'],
    ['sub', 'text/vnd.dvb.subtitle; charset=utf-8'],
    ['xml', 'application/xml'],
    ['rtf', 'application/rtf'],
    ['mp3', 'audio/mpeg'],
  ])('contentType gives %s its header', (ext, header) => {
    expect(contentType(ext)).toBe(header)
  })

  it.each([
    ['text/javascript', 'UTF-8'],
    ['text/xml', 'UTF-8'],
    ['text/rtf', 'UTF-8'],
    ['application/xml', false],
    ['application/rtf', false],
  ])('charset gives %s its charset', (type, expected) => {
    expect(charset(type)).toBe(expected)
  })
})
