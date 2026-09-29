import type { GarageConfig } from '../types/garage'
import { normalizeGarageConfig } from './config'

const encodedKey = 'garage'

const PUBLIC_SITE_URL =
    'https://www.thegaragebuilders.net'

function base64FromUtf8(value: string) {
  const bytes =
      new TextEncoder().encode(value)

  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

function utf8FromBase64(value: string) {
  const binary = atob(value)

  const bytes =
      Uint8Array.from(
          binary,
          (char) =>
              char.charCodeAt(0)
      )

  return new TextDecoder().decode(bytes)
}

export function encodeConfig(
    config: GarageConfig
) {
  return base64FromUtf8(
      JSON.stringify(
          normalizeGarageConfig(config)
      )
  )
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '')
}

export function decodeConfig(
    value: string
): GarageConfig | null {
  try {
    const padded =
        value
            .replaceAll('-', '+')
            .replaceAll('_', '/') +
        '==='.slice(
            (value.length + 3) % 4
        )

    return normalizeGarageConfig(
        JSON.parse(
            utf8FromBase64(padded)
        )
    )
  } catch {
    return null
  }
}

export function makeShareUrl(
    config: GarageConfig,
    origin?: string
) {
  const baseUrl =
      origin ??
      (
          window.location.hostname ===
          'localhost' ||
          window.location.hostname ===
          '127.0.0.1'
              ? PUBLIC_SITE_URL
              : window.location.origin
      )

  const url =
      new URL(baseUrl)

  url.searchParams.set(
      encodedKey,
      encodeConfig(config)
  )

  return url.toString()
}

export function loadConfigFromUrl() {
  const value =
      new URLSearchParams(
          window.location.search
      ).get(encodedKey)

  return value
      ? decodeConfig(value)
      : null
}