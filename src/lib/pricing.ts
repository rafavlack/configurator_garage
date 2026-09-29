import type { GarageConfig, QuoteEstimate, QuoteLineItem } from '../types/garage'

/**
 * Planning-cost model, USD, based on current 2026 published market ranges.
 * These are installed planning allowances, not bids. Local labor, wind code,
 * engineering, site conditions, permits and product selections can move the final price.
 */
const RATES = {
  foundation: [6, 12],
  structure: [20, 30],
  siding: {
    vinyl: [5.5, 8.5],
    fiberCement: [7.5, 12],
    stucco: [8, 12],
    brick: [12, 22],
    metal: [5, 9],
  },
  roof: {
    architecturalShingle: [2, 5],
    standingSeam: [5, 20],
    concreteTile: [7.5, 17],
  },
  trimPerLinearFoot: [2.5, 5],
  guttersPerLinearFoot: [8, 18],
  window: [650, 980],
  door: {
    single: [1800, 3200],
    double: [3000, 5200],
    carriage: [6200, 9800],
  },
  attic: [4500, 7200],
  electrical: [3500, 6200],
  permit: [1200, 1500],
  engineering: [1800, 3500],
} as const

const ROOF_OVERHANG_FT = 1.44

function rangeFor(rate: readonly [number, number], quantity: number) {
  return [rate[0] * quantity, rate[1] * quantity] as const
}

export function estimateGarage(config: GarageConfig): QuoteEstimate {
  const { width, depth, wallHeight } = config.dimensions
  const floorArea = width * depth
  const perimeter = 2 * (width + depth)
  const wallArea = perimeter * wallHeight
  const roofRun = width / 2 + ROOF_OVERHANG_FT
  const roofRise = (width / 2) * (config.roof.pitch / 12)
  const roofPanelLength = Math.sqrt(roofRun ** 2 + roofRise ** 2)
  const roofDepth = depth + ROOF_OVERHANG_FT * 2
  const roofArea = 2 * roofPanelLength * roofDepth

  const items: QuoteLineItem[] = []
  const add = (name: string, low: number, high: number, detail: string) => items.push({ name, low, high, detail })

  const [foundationLow, foundationHigh] = rangeFor(RATES.foundation, floorArea)
  add('Concrete slab & foundation', foundationLow, foundationHigh, `${Math.round(floorArea)} sq ft × $6–$12/sq ft`)

  const [structureLow, structureHigh] = rangeFor(RATES.structure, floorArea)
  add('Framing, sheathing & general structure', structureLow, structureHigh, `${Math.round(floorArea)} sq ft structural allowance`)

  const sidingRate = RATES.siding[config.siding.type]
  const [sidingLow, sidingHigh] = rangeFor(sidingRate, wallArea)
  add('Exterior siding / cladding', sidingLow, sidingHigh, `${Math.round(wallArea)} sq ft wall area`)

  const roofRate = RATES.roof[config.roof.material]
  const [roofLow, roofHigh] = rangeFor(roofRate, roofArea)
  add('Roof assembly & covering', roofLow, roofHigh, `${Math.round(roofArea)} sq ft roof area`)

  const [doorLow, doorHigh] = RATES.door[config.door.style]
  add('Garage door & hardware', doorLow, doorHigh, `${config.door.width}' × ${config.door.height}' ${config.door.style}`)

  const [windowLow, windowHigh] = rangeFor(RATES.window, config.windows.count)
  if (config.windows.count) add('Windows & installation', windowLow, windowHigh, `${config.windows.count} windows`)

  const [trimLow, trimHigh] = rangeFor(RATES.trimPerLinearFoot, perimeter)
  add('Exterior trim, fascia & soffit', trimLow, trimHigh, `${Math.round(perimeter)} linear ft allowance`)

  if (config.options.gutters) {
    const gutterLength = perimeter
    const [low, high] = rangeFor(RATES.guttersPerLinearFoot, gutterLength)
    add('Gutters & downspouts', low, high, `${Math.round(gutterLength)} linear ft`)
  }

  if (config.options.attic) add('Attic / storage package', ...RATES.attic, 'Framing, floor/storage allowance')
  if (config.options.electrical) add('Electrical package', ...RATES.electrical, 'Service, outlets and lighting allowance')

  add('Permitting allowance', ...RATES.permit, 'Typical planning allowance; jurisdiction varies')
  add('Engineering / design allowance', ...RATES.engineering, 'Plans, structural review and engineering allowance')

  const rawLow = items.reduce((sum, item) => sum + item.low, 0)
  const rawHigh = items.reduce((sum, item) => sum + item.high, 0)

  // Construction pricing is not linear at every size. Add a modest general
  // conditions / mobilization factor while keeping the UI transparent.
  const low = rawLow * 1.06
  const high = rawHigh * 1.12

  return {
    low: Math.round(low / 500) * 500,
    high: Math.round(high / 500) * 500,
    items,
    basis: '2026 planning allowances; national published ranges with a Florida/Tampa market cross-check',
  }
}
