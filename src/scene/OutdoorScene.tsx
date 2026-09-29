import { ContactShadows, OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { GarageConfig } from '../types/garage'
import * as THREE from 'three'
import { useGarageStore } from '../state/useGarageStore'
import { GarageModel } from './GarageModel'

function CameraController() {
  const view = useGarageStore((s) => s.view)
  const config = useGarageStore((s) => s.config)
  const { camera } = useThree()
  const configRef = useRef(config)
  const first = useRef(true)
  const previousView = useRef(view)

  // Keep the latest construction dimensions available without making the camera
  // react to every material/dimension/configuration change. The camera must only
  // move when the user explicitly changes the requested view.
  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    if (!first.current && previousView.current === view) return

    const c = camera as THREE.PerspectiveCamera
    const current = configRef.current
    const span = Math.max(24, Math.max(current.dimensions.width, current.dimensions.depth))
    const targetY = Math.max(4.6, current.dimensions.wallHeight * 0.65)
    const distance = Math.max(30, span * 1.12)

    const map: Record<typeof view, [number, number, number]> = {
      hero: [distance * 0.76, 15.5, distance * 0.86],
      front: [0, 7.6, -distance * 1.05],
      side: [distance * 1.06, 8.0, 1.6],
      back: [0, 7.6, distance * 1.05],
      top: [0, Math.max(30, span * 1.15), 0.1],
    }

    const [x, y, z] = map[view]
    c.position.set(x, y, z)
    c.lookAt(0, targetY, 0)
    c.updateProjectionMatrix()

    first.current = false
    previousView.current = view
  }, [view, camera])

  return null
}

function TerrainMaterial({ color = '#6f7869' }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={1} metalness={0} />
}

function Terrain({ config }: { config: GarageConfig }) {
  const span = Math.max(config.dimensions.width, config.dimensions.depth)
  const extent = Math.max(110, span * 2.6)
  const drivewayWidth = Math.min(26, Math.max(12, config.door.width + 5))
  const drivewayLength = Math.max(42, config.dimensions.depth + 26)

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]} receiveShadow>
        <planeGeometry args={[extent, extent]} />
        <TerrainMaterial />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, -config.dimensions.depth / 2 - drivewayLength / 2 + 0.4]} receiveShadow>
        <planeGeometry args={[drivewayWidth, drivewayLength]} />
        <meshStandardMaterial color="#777874" roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.075, -config.dimensions.depth / 2 - 7.5]} receiveShadow>
        <planeGeometry args={[drivewayWidth + 3.2, 1.1]} />
        <meshStandardMaterial color="#a0a096" roughness={0.91} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, -config.dimensions.depth / 2 - 4.2]} receiveShadow>
        <planeGeometry args={[2.8, 11]} />
        <meshStandardMaterial color="#8b8b83" roughness={0.94} />
      </mesh>

      <PlantBed position={[-config.dimensions.width / 2 - 4.1, 0.02, -config.dimensions.depth * 0.05]} size={[5.8, Math.max(10, config.dimensions.depth * 0.65)]} />
      <PlantBed position={[config.dimensions.width / 2 + 4.1, 0.02, config.dimensions.depth * 0.12]} size={[5.8, Math.max(12, config.dimensions.depth * 0.72)]} />
      <StoneStrip position={[0, 0.02, config.dimensions.depth / 2 + 1.6]} size={[config.dimensions.width + 8, 2.2]} />
    </group>
  )
}

function PlantBed({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#4f5645" roughness={1} />
      </mesh>
      <Shrub position={[0, 0.5, 0]} scale={1.1} />
      <Shrub position={[size[0] * 0.18, 0.4, size[1] * 0.18]} scale={0.78} />
      <Shrub position={[-size[0] * 0.18, 0.34, -size[1] * 0.2]} scale={0.66} />
    </group>
  )
}

function StoneStrip({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  const stones = useMemo(() => Array.from({ length: Math.floor(size[0] / 2) }, (_, i) => ({
    x: -size[0] / 2 + 1 + i * 2 + ((i % 3) - 1) * 0.24,
    z: ((i * 17) % 11) / 11 * (size[1] - 0.7) - (size[1] - 0.7) / 2,
    r: 0.55 + (i % 4) * 0.08,
  })), [size])
  return (
    <group position={position}>
      {stones.map((stone, i) => (
        <mesh key={i} position={[stone.x, stone.r * 0.32, stone.z]} scale={[1.35, 0.55, 0.9]} castShadow receiveShadow>
          <dodecahedronGeometry args={[stone.r, 1]} />
          <meshStandardMaterial color={i % 2 ? '#77746c' : '#8a877f'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Shrub({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[1.35, 14, 10]} />
        <meshStandardMaterial color="#5b684f" roughness={1} />
      </mesh>
      <mesh position={[0.7, 0.16, -0.18]} castShadow>
        <sphereGeometry args={[0.82, 12, 9]} />
        <meshStandardMaterial color="#66735a" roughness={1} />
      </mesh>
      <mesh position={[-0.58, 0.2, 0.22]} castShadow>
        <sphereGeometry args={[0.7, 12, 9]} />
        <meshStandardMaterial color="#4d5c45" roughness={1} />
      </mesh>
    </group>
  )
}

function Tree({ position, scale = 1, type = 0 }: { position: [number, number, number]; scale?: number; type?: number }) {
  const trunk = type % 2 ? '#5d4735' : '#4d3b2e'
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 3.1, 0]}>
        <cylinderGeometry args={[0.24, 0.46, 6.2, 10]} />
        <meshStandardMaterial color={trunk} roughness={0.94} />
      </mesh>
      <mesh castShadow position={[0, 7.1, 0]}>
        <coneGeometry args={[2.65, 5.8, 12]} />
        <meshStandardMaterial color={type % 2 ? '#4e6049' : '#55694d'} roughness={1} />
      </mesh>
      <mesh castShadow position={[0.9, 8.1, 0.1]} scale={0.68}>
        <sphereGeometry args={[1.8, 14, 10]} />
        <meshStandardMaterial color="#65775a" roughness={1} />
      </mesh>
    </group>
  )
}

function SceneCapture({ captureToken }: { captureToken: number }) {
  const { gl } = useThree()
  const last = useRef(0)
  useEffect(() => {
    if (!captureToken || captureToken === last.current) return
    last.current = captureToken
    const url = gl.domElement.toDataURL('image/png', 0.94)
    const link = document.createElement('a')
    link.href = url
    link.download = `tgb-garage-design-${Date.now()}.png`
    link.click()
  }, [captureToken, gl])
  return null
}

export function OutdoorScene({ captureToken = 0 }: { captureToken?: number }) {
  const config = useGarageStore((s) => s.config)
  const span = Math.max(config.dimensions.width, config.dimensions.depth)
  const far = Math.max(220, span * 5)
  const initialCameraDistance = useRef(Math.max(34, span * 1.12)).current

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [initialCameraDistance, 18, initialCameraDistance], fov: 40, near: 0.1, far }}
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        scene.fog = new THREE.Fog('#c6d1d2', span * 1.6, far * 0.72)
      }}
    >
      <color attach="background" args={['#c2cfd2']} />
      <fog attach="fog" args={['#c6d1d2', span * 1.6, far * 0.72]} />
      <Sky sunPosition={[80, 52, 28]} turbidity={5.6} rayleigh={1.8} mieCoefficient={0.012} mieDirectionalG={0.82} />
      <hemisphereLight intensity={1.55} color="#eaf2f4" groundColor="#697062" />
      <ambientLight intensity={0.16} />
      <directionalLight
        castShadow
        intensity={4.1}
        position={[45, 68, 30]}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={Math.max(180, span * 4)}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.00014}
        shadow-normalBias={0.025}
      />
      <directionalLight intensity={0.6} position={[-30, 18, -45]} color="#b9d1ff" />

      <PerspectiveCamera makeDefault position={[initialCameraDistance, 18, initialCameraDistance]} fov={40} near={0.1} far={far} />
      <CameraController />
      <Terrain config={config} />
      <GarageModel />

      <Tree position={[-Math.max(26, span * 0.72), 0, -Math.max(27, span * 0.84)]} scale={1.2} type={0} />
      <Tree position={[Math.max(30, span * 0.8), 0, -Math.max(17, span * 0.53)]} scale={0.9} type={1} />
      <Tree position={[Math.max(34, span * 0.9), 0, Math.max(22, span * 0.63)]} scale={1.15} type={0} />
      <Tree position={[-Math.max(35, span * 0.96), 0, Math.max(26, span * 0.68)]} scale={0.82} type={1} />

      <ContactShadows position={[0, 0.012, 0]} opacity={0.44} blur={2.8} far={Math.max(46, span * 1.8)} resolution={512} scale={Math.max(70, span * 2.4)} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.075} minDistance={12} maxDistance={180} maxPolarAngle={Math.PI * 0.495} target={[0, 5.8, 0]} />
      <SceneCapture captureToken={captureToken} />
    </Canvas>
  )
}
