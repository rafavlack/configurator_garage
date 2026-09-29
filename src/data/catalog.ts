import type { GarageConfig } from '../types/garage'

export const SIDING_OPTIONS = [
  { id: 'vinyl', name: 'Premium Vinyl', color: '#d9d6ce', swatches: ['#e4e1d8', '#d0cbc1', '#a9a79f', '#27333a'], note: 'Low-maintenance cladding; assembly and wind rating vary' },
  { id: 'fiberCement', name: 'Fiber Cement', color: '#d2cec5', swatches: ['#d7d2c8', '#b8b4ab', '#817e78', '#2a3133'], note: 'Durable lap-board; fastening and substrate are assembly-specific' },
  { id: 'stucco', name: 'Stucco', color: '#d8d1c3', swatches: ['#e3ddd0', '#d0c4b0', '#b3a58f', '#6f6659'], note: 'Masonry-style finish; substrate and drainage plane matter' },
  { id: 'brick', name: 'Brick Veneer', color: '#9b5d45', swatches: ['#a86148', '#7e4638', '#c28b6e', '#5c3830'], note: 'Non-structural veneer; flashing and drainage assembly required' },
  { id: 'metal', name: 'Architectural Metal', color: '#737d80', swatches: ['#8f9799', '#42484b', '#34474a', '#202528'], note: 'Metal panel finish; profile, substrate and corrosion rating vary' },
] as const

export const ROOF_OPTIONS = [
  { id: 'architecturalShingle', name: 'Architectural Shingle', note: 'Fiberglass asphalt shingle system' },
  { id: 'standingSeam', name: 'Standing Seam Metal', note: 'Standing-seam metal roof system' },
  { id: 'concreteTile', name: 'Concrete Tile', note: 'Concrete tile roof system; structural load must be verified' },
] as const

export const ROOF_PITCHES = [4, 5, 6, 7, 8] as const
export const TRIM_OPTIONS = [
  { id: 'white', name: 'White', color: '#f1eee7' },
  { id: 'bronze', name: 'Dark Bronze', color: '#2b2926' },
  { id: 'black', name: 'Black', color: '#151515' },
] as const
export const DOOR_OPTIONS = [
  { id: 'double', name: 'Double Door', width: 16, height: 7, price: 0 },
  { id: 'single', name: 'Single Door', width: 9, height: 7, price: -1800 },
  { id: 'carriage', name: 'Carriage Style', width: 16, height: 7, price: 3200 },
] as const

export const DEFAULT_CONFIG: GarageConfig = {
  dimensions: { width: 24, depth: 30, wallHeight: 9 },
  roof: { type: 'gable', pitch: 6, material: 'architecturalShingle' },
  siding: { type: 'vinyl', color: '#d0cbc1' },
  trim: { color: 'white' },
  door: { style: 'double', width: 16, height: 7, color: '#f1eee7' },
  windows: { count: 4, frameColor: '#f1eee7' },
  foundation: 'slab',
  options: { gutters: true, attic: false, electrical: false },
}
