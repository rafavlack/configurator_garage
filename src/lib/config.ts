import {
  DEFAULT_CONFIG,
  DOOR_OPTIONS,
  ROOF_PITCHES,
  SIDING_OPTIONS,
  TRIM_OPTIONS,
} from '../data/catalog'
import type { GarageConfig } from '../types/garage'
import { clampDimensions } from './geometry'

const HEX = /^#[0-9a-fA-F]{6}$/

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
      ? value
      : fallback
}

function oneOf<T extends string>(
    value: unknown,
    values: readonly T[],
    fallback: T,
): T {
  return typeof value === 'string' && values.includes(value as T)
      ? (value as T)
      : fallback
}

type PartialGarageConfig = {
  dimensions?: Partial<GarageConfig['dimensions']>
  siding?: Partial<GarageConfig['siding']>
  roof?: Partial<GarageConfig['roof']>
  trim?: Partial<GarageConfig['trim']>
  door?: Partial<GarageConfig['door']>
  windows?: Partial<GarageConfig['windows']>
  foundation?: GarageConfig['foundation']
  options?: Partial<GarageConfig['options']>
}

export function normalizeGarageConfig(input: unknown): GarageConfig {
  const source: PartialGarageConfig =
      input && typeof input === 'object'
          ? (input as PartialGarageConfig)
          : {}

  const dimensions = source.dimensions ?? {}
  const siding = source.siding ?? {}
  const roof = source.roof ?? {}
  const trim = source.trim ?? {}
  const door = source.door ?? {}
  const windows = source.windows ?? {}
  const options = source.options ?? {}

  const clamped = clampDimensions(
      finiteNumber(
          dimensions.width,
          DEFAULT_CONFIG.dimensions.width,
      ),
      finiteNumber(
          dimensions.depth,
          DEFAULT_CONFIG.dimensions.depth,
      ),
      finiteNumber(
          dimensions.wallHeight,
          DEFAULT_CONFIG.dimensions.wallHeight,
      ),
  )

  // Keep values on a practical construction-oriented grid.
  clamped.width = Math.round(clamped.width / 2) * 2
  clamped.depth = Math.round(clamped.depth / 2) * 2
  clamped.wallHeight = Math.round(clamped.wallHeight)

  const sidingType = oneOf(
      siding.type,
      SIDING_OPTIONS.map((item) => item.id),
      DEFAULT_CONFIG.siding.type,
  )

  const defaultSidingColor =
      SIDING_OPTIONS.find((item) => item.id === sidingType)?.color ??
      DEFAULT_CONFIG.siding.color

  const sidingColor =
      typeof siding.color === 'string' && HEX.test(siding.color)
          ? siding.color
          : defaultSidingColor

  const trimColor = oneOf(
      trim.color,
      TRIM_OPTIONS.map((item) => item.id),
      DEFAULT_CONFIG.trim.color,
  )

  const roofMaterial = oneOf(
      roof.material,
      [
        'architecturalShingle',
        'standingSeam',
        'concreteTile',
      ] as const,
      DEFAULT_CONFIG.roof.material,
  )

  const roofType = oneOf(
      roof.type,
      ['gable', 'hip'] as const,
      DEFAULT_CONFIG.roof.type,
  )

  const pitchRaw = finiteNumber(
      roof.pitch,
      DEFAULT_CONFIG.roof.pitch,
  )

  const pitch = [...ROOF_PITCHES].sort(
      (a, b) =>
          Math.abs(a - pitchRaw) -
          Math.abs(b - pitchRaw),
  )[0]

  const requestedDoor = oneOf(
      door.style,
      DOOR_OPTIONS.map((item) => item.id),
      DEFAULT_CONFIG.door.style,
  )

  const doorCatalog =
      DOOR_OPTIONS.find(
          (item) => item.id === requestedDoor,
      ) ?? DOOR_OPTIONS[0]

  const maxDoorWidth = Math.max(
      8,
      clamped.width - 1.6,
  )

  const maxDoorHeight = Math.max(
      6.4,
      clamped.wallHeight - 1.0,
  )

  const doorWidth = Math.min(
      maxDoorWidth,
      Math.max(
          8,
          finiteNumber(
              door.width,
              doorCatalog.width,
          ),
      ),
  )

  const doorHeight = Math.min(
      maxDoorHeight,
      Math.max(
          6.4,
          finiteNumber(
              door.height,
              doorCatalog.height,
          ),
      ),
  )

  const doorColor =
      typeof door.color === 'string' &&
      HEX.test(door.color)
          ? door.color
          : DEFAULT_CONFIG.door.color

  const rawCount = finiteNumber(
      windows.count,
      DEFAULT_CONFIG.windows.count,
  )

  const windowCount = (
      [0, 2, 4, 6] as const
  ).reduce(
      (closest, value) =>
          Math.abs(value - rawCount) <
          Math.abs(closest - rawCount)
              ? value
              : closest,
      4 as 0 | 2 | 4 | 6,
  )

  const frameColor =
      typeof windows.frameColor === 'string' &&
      HEX.test(windows.frameColor)
          ? windows.frameColor
          : DEFAULT_CONFIG.windows.frameColor

  return {
    dimensions: clamped,

    roof: {
      type: roofType,
      pitch,
      material: roofMaterial,
    },

    siding: {
      type: sidingType,
      color: sidingColor,
    },

    trim: {
      color: trimColor,
    },

    door: {
      style: requestedDoor,
      width: doorWidth,
      height: doorHeight,
      color: doorColor,
    },

    windows: {
      count: windowCount,
      frameColor,
    },

    foundation: 'slab',

    options: {
      gutters: Boolean(
          options.gutters ??
          DEFAULT_CONFIG.options.gutters,
      ),

      attic: Boolean(
          options.attic ??
          DEFAULT_CONFIG.options.attic,
      ),

      electrical: Boolean(
          options.electrical ??
          DEFAULT_CONFIG.options.electrical,
      ),
    },
  }
}