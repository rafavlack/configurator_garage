import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_CONFIG } from '../data/catalog'
import { normalizeGarageConfig } from '../lib/config'
import type { GarageConfig } from '../types/garage'

interface GarageStore {
  config: GarageConfig
  view: 'hero' | 'front' | 'side' | 'back' | 'top'
  configureTab: 'size' | 'exterior' | 'openings' | 'options'
  setConfig: (next: GarageConfig) => void
  updateConfig: <K extends keyof GarageConfig>(key: K, value: GarageConfig[K]) => void
  updateDimensions: (values: Partial<GarageConfig['dimensions']>) => void
  reset: () => void
  setView: (view: GarageStore['view']) => void
  setTab: (tab: GarageStore['configureTab']) => void
}

export const useGarageStore = create<GarageStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      view: 'hero',
      configureTab: 'size',
      setConfig: (next) => set({ config: normalizeGarageConfig(next) }),
      updateConfig: (key, value) => set((state) => ({ config: normalizeGarageConfig({ ...state.config, [key]: value }) })),
      updateDimensions: (values) => set((state) => ({ config: normalizeGarageConfig({
        ...state.config,
        dimensions: { ...state.config.dimensions, ...values },
      }) })),
      reset: () => set({ config: DEFAULT_CONFIG, view: 'hero', configureTab: 'size' }),
      setView: (view) => set({ view }),
      setTab: (configureTab) => set({ configureTab }),
    }),
    {
      name: 'tgb-garage-config-v2',
      merge: (persisted, current) => {
        const stored = persisted as Partial<GarageStore> | undefined
        return {
          ...current,
          ...stored,
          config: normalizeGarageConfig(stored?.config ?? current.config),
          view: stored?.view ?? current.view,
          configureTab: stored?.configureTab ?? current.configureTab,
        }
      },
    },
  ),
)
