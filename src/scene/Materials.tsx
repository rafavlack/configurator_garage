import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { concreteTexture, roofTexture, sidingTexture } from './TextureFactory'
import type { RoofMaterial, SidingType } from '../types/garage'

export function useSidingMaterial(color: string, mode: SidingType, side: THREE.Side = THREE.FrontSide) {
  const maps = useMemo(() => sidingTexture(color, mode), [color, mode])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map: maps.color, normalMap: maps.normal, roughnessMap: maps.roughness, roughness: mode === 'metal' ? .38 : mode === 'stucco' ? .9 : mode === 'brick' ? .88 : .74, metalness: mode === 'metal' ? .62 : 0, side, envMapIntensity: mode === 'metal' ? 1.35 : .8 }), [maps, mode, side])
  useEffect(() => () => { material.dispose(); maps.color.dispose(); maps.normal.dispose(); maps.roughness.dispose() }, [material, maps])
  return material
}

export function useRoofMaterial(type: RoofMaterial) {
  const maps = useMemo(() => roofTexture(type), [type])
  const repeat: [number, number] = type === 'standingSeam' ? [1.25, 4.5] : type === 'concreteTile' ? [2.1, 3.8] : [2.1, 2.4]
  maps.color.repeat.set(...repeat); maps.normal.repeat.set(...repeat); maps.roughness.repeat.set(...repeat)
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map: maps.color, normalMap: maps.normal, roughnessMap: maps.roughness, roughness: type === 'standingSeam' ? .27 : type === 'concreteTile' ? .72 : .82, metalness: type === 'standingSeam' ? .78 : .04, envMapIntensity: type === 'standingSeam' ? 1.75 : .72 }), [maps, type])
  useEffect(() => () => { material.dispose(); maps.color.dispose(); maps.normal.dispose(); maps.roughness.dispose() }, [material, maps])
  return material
}

export function useConcreteMaterial() {
  const maps = useMemo(() => concreteTexture(), [])
  maps.color.repeat.set(3.2, 3.2); maps.normal.repeat.set(3.2, 3.2); maps.roughness.repeat.set(3.2, 3.2)
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map: maps.color, normalMap: maps.normal, roughnessMap: maps.roughness, roughness: .93, metalness: 0, envMapIntensity: .55 }), [maps])
  useEffect(() => () => { material.dispose(); maps.color.dispose(); maps.normal.dispose(); maps.roughness.dispose() }, [material, maps])
  return material
}
