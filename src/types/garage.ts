export type RoofType = 'gable' | 'hip'
export type SidingType = 'vinyl' | 'fiberCement' | 'metal' | 'stucco' | 'brick'
export type RoofMaterial = 'architecturalShingle' | 'standingSeam' | 'concreteTile'
export type DoorStyle = 'double' | 'single' | 'carriage'
export type TrimColor = 'white' | 'bronze' | 'black'

export interface GarageConfig {
  dimensions: { width: number; depth: number; wallHeight: number }
  roof: { type: RoofType; pitch: number; material: RoofMaterial }
  siding: { type: SidingType; color: string }
  trim: { color: TrimColor }
  door: { style: DoorStyle; width: number; height: number; color: string }
  windows: { count: 0 | 2 | 4 | 6; frameColor: string }
  foundation: 'slab'
  options: { gutters: boolean; attic: boolean; electrical: boolean }
}

export interface QuoteLineItem { name: string; low: number; high: number; detail: string }
export interface QuoteEstimate { low: number; high: number; items: QuoteLineItem[]; basis: string }
export interface LeadFormData { name: string; email: string; phone: string; city: string; notes: string }
