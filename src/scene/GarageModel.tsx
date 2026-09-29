import { useMemo } from 'react'
import type { ReactElement } from 'react'
import * as THREE from 'three'
import { pitchAngle, roofPanelLength, roofRise } from '../lib/geometry'
import { useGarageStore } from '../state/useGarageStore'
import { useConcreteMaterial, useRoofMaterial, useSidingMaterial } from './Materials'
import type { GarageConfig } from '../types/garage'

const trimMap = { white: '#f1eee7', bronze: '#302d29', black: '#17191a' } as const
const metalMap = { white: '#d7d3ca', bronze: '#51473d', black: '#292d2e' } as const
type Vec3 = [number, number, number]

function Box({ args, position, color, roughness = .62, metalness = 0, rotation = [0, 0, 0], castShadow = true, receiveShadow = true }: { args: Vec3; position: Vec3; color: string; roughness?: number; metalness?: number; rotation?: Vec3; castShadow?: boolean; receiveShadow?: boolean }) {
  return <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow}><boxGeometry args={args}/><meshStandardMaterial color={color} roughness={roughness} metalness={metalness}/></mesh>
}
function Wall({ position, args, material }: { position: Vec3; args: Vec3; material: THREE.Material }) {
  return <mesh position={position} material={material} castShadow receiveShadow><boxGeometry args={args}/></mesh>
}
function Cylinder({ args, position, rotation = [0,0,0], color, roughness=.45, metalness=.5 }: { args:[number,number,number,number]; position:Vec3; rotation?:Vec3; color:string; roughness?:number; metalness?:number }) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow><cylinderGeometry args={args}/><meshStandardMaterial color={color} roughness={roughness} metalness={metalness}/></mesh>
}

function Foundation({ config, concrete }: { config: GarageConfig; concrete: THREE.Material }) {
  const { width, depth } = config.dimensions
  return <group>
    <mesh position={[0,.08,0]} material={concrete} receiveShadow castShadow><boxGeometry args={[width+1.4,.16,depth+1.4]}/></mesh>
    <mesh position={[0,.19,0]} receiveShadow castShadow><boxGeometry args={[width,.22,depth]}/><meshStandardMaterial color="#aaa69d" roughness={.96}/></mesh>
    <Box args={[width+.1,.13,.18]} position={[0,.38,-depth/2+.08]} color="#817d75" roughness={.92}/>
    <Box args={[width+.1,.13,.18]} position={[0,.38,depth/2-.08]} color="#817d75" roughness={.92}/>
    <Box args={[.18,.13,depth-.16]} position={[-width/2+.08,.38,0]} color="#817d75" roughness={.92}/>
    <Box args={[.18,.13,depth-.16]} position={[width/2-.08,.38,0]} color="#817d75" roughness={.92}/>
  </group>
}

function FrontWall({ config, material }: { config: GarageConfig; material: THREE.Material }) {
  const { width, depth, wallHeight } = config.dimensions
  const doorW = Math.min(config.door.width, width - 1.6)
  const doorH = Math.min(config.door.height, wallHeight - .55)
  const z = -depth/2
  const sideW = Math.max(.8, (width-doorW)/2)
  const headerH = Math.max(.6, wallHeight-doorH)
  return <group>
    <Wall position={[-doorW/2-sideW/2, wallHeight/2, z]} args={[sideW,wallHeight,.38]} material={material}/>
    <Wall position={[doorW/2+sideW/2, wallHeight/2, z]} args={[sideW,wallHeight,.38]} material={material}/>
    <Wall position={[0, doorH+headerH/2, z]} args={[doorW,headerH,.38]} material={material}/>
  </group>
}

function Door({ config }: { config: GarageConfig }) {
  const { width: requestedW, height: requestedH, color, style } = config.door
  const width = Math.min(requestedW, config.dimensions.width - 1.6)
  const height = Math.min(requestedH, config.dimensions.wallHeight - .55)
  const frame = trimMap[config.trim.color]
  const frontZ = -config.dimensions.depth/2 - .18
  const bottom = .41
  const rows = 4
  const gap = .075
  const panelH = Math.max(.85, (height-.26-gap*(rows-1))/rows)
  const panes = Math.max(3, Math.floor(width/3.7))
  return <group>
    <Box args={[width+.42,height+.42,.18]} position={[0,bottom+height/2,frontZ+.13]} color={frame} roughness={.45}/>
    <Box args={[width,.10,.28]} position={[0,bottom-.01,frontZ+.09]} color={metalMap[config.trim.color]} roughness={.45} metalness={.18}/>
    {Array.from({length:rows},(_,row)=>{
      const y=bottom+.10+row*(panelH+gap)+panelH/2
      return <group key={row}>
        <Box args={[width,panelH,.105]} position={[0,y,frontZ]} color={color} roughness={.47}/>
        <Box args={[width-.18,.035,.028]} position={[0,y-panelH/2+.045,frontZ-.064]} color="#9a978f" roughness={.75}/>
        {style==='carriage' && row===rows-1 && Array.from({length:panes},(_,i)=>{
          const paneW=(width-.45-(panes-1)*.10)/panes
          const x=-width/2+.225+paneW/2+i*(paneW+.10)
          return <group key={i} position={[x,y,frontZ-.065]}>
            <Box args={[paneW,.95,.045]} position={[0,0,0]} color="#58727b" roughness={.10} metalness={.04}/>
            <Box args={[.045,.86,.025]} position={[0,0,-.028]} color={frame} roughness={.4}/>
            <Box args={[Math.max(.12,paneW-.03),.045,.025]} position={[0,0,-.028]} color={frame} roughness={.4}/>
          </group>
        })}
      </group>
    })}
    {style==='carriage' && <>
      <Box args={[.075,height-.65,.08]} position={[-width*.18,bottom+height/2,frontZ-.085]} color="#3f3831" roughness={.32}/>
      <Box args={[.075,height-.65,.08]} position={[width*.18,bottom+height/2,frontZ-.085]} color="#3f3831" roughness={.32}/>
      <Cylinder args={[.055,.055,.22,12]} position={[-width*.42,bottom+height/2,frontZ-.12]} rotation={[Math.PI/2,0,0]} color="#1f2222"/>
      <Cylinder args={[.055,.055,.22,12]} position={[width*.42,bottom+height/2,frontZ-.12]} rotation={[Math.PI/2,0,0]} color="#1f2222"/>
    </>}
    <Box args={[width-.5,.055,.055]} position={[0,bottom+height+.10,frontZ-.04]} color="#565b5b" roughness={.3} metalness={.7}/>
  </group>
}

function WindowUnit({ position, rotation, frameColor, trimColor, wide=false }: { position:Vec3; rotation:Vec3; frameColor:string; trimColor:string; wide?:boolean }) {
  const width=wide?3.7:3.2, height=2.15
  return <group position={position} rotation={rotation}>
    <Box args={[width+.38,height+.38,.22]} position={[0,0,0]} color={trimColor} roughness={.46}/>
    <mesh position={[0,0,.13]} castShadow receiveShadow><boxGeometry args={[width,height,.055]}/><meshPhysicalMaterial color="#668994" roughness={.08} metalness={.03} transmission={.18} thickness={.25} ior={1.46} clearcoat={.55}/></mesh>
    <Box args={[.13,height-.12,.07]} position={[0,0,.18]} color={frameColor} roughness={.34}/>
    <Box args={[width-.12,.13,.07]} position={[0,0,.18]} color={frameColor} roughness={.34}/>
    <Box args={[width+.22,.16,.28]} position={[0,-height/2-.15,.08]} color={trimColor} roughness={.58}/>
  </group>
}

function Windows({ config }: { config: GarageConfig }) {
  const { width, depth, wallHeight }=config.dimensions
  const units=config.windows.count===2?1:config.windows.count===4?2:config.windows.count===6?3:0
  if(!units) return null
  const y=Math.min(wallHeight-1.6,5.55)
  const positions=Array.from({length:units},(_,i)=>units===1?0:-depth*.29+i*(depth*.58/(units-1)))
  return <group>{positions.flatMap((z,i)=>[
    <WindowUnit key={`l${i}`} position={[-width/2-.21,y,z]} rotation={[0,Math.PI/2,0]} frameColor={config.windows.frameColor} trimColor={trimMap[config.trim.color]}/>,
    <WindowUnit key={`r${i}`} position={[width/2+.21,y,z]} rotation={[0,-Math.PI/2,0]} frameColor={config.windows.frameColor} trimColor={trimMap[config.trim.color]}/>,
  ])}</group>
}

function SideWalls({ config, material }: { config: GarageConfig; material: THREE.Material }) {
  const {width,depth,wallHeight}=config.dimensions
  const units=config.windows.count===2?1:config.windows.count===4?2:config.windows.count===6?3:0
  if(!units) return <Wall position={[0,wallHeight/2,depth/2]} args={[width,wallHeight,.38]} material={material}/>
  const openingW=3.72, openingH=2.15, openingY=Math.min(wallHeight-1.6,5.55)
  const centers=Array.from({length:units},(_,i)=>units===1?0:-depth*.29+i*(depth*.58/(units-1)))
  const render=(x:number)=>{
    const parts: ReactElement[] = []
    let cursor=-depth/2
    centers.forEach((c,i)=>{const a=Math.max(-depth/2,c-openingW/2),b=Math.min(depth/2,c+openingW/2);if(a>cursor)parts.push(<Wall key={`s${x}${i}`} position={[x,wallHeight/2,cursor+(a-cursor)/2]} args={[.38,wallHeight,a-cursor]} material={material}/>);cursor=Math.max(cursor,b)})
    if(cursor<depth/2)parts.push(<Wall key={`e${x}`} position={[x,wallHeight/2,cursor+(depth/2-cursor)/2]} args={[.38,wallHeight,depth/2-cursor]} material={material}/> )
    const lowerH=Math.max(.4,openingY-openingH/2), upperStart=openingY+openingH/2, upperH=Math.max(.4,wallHeight-upperStart)
    centers.forEach((c,i)=>{parts.push(<Wall key={`b${x}${i}`} position={[x,lowerH/2,c]} args={[.38,lowerH,openingW]} material={material}/>);parts.push(<Wall key={`t${x}${i}`} position={[x,upperStart+upperH/2,c]} args={[.38,upperH,openingW]} material={material}/>)})
    return parts
  }
  return <>{render(-width/2)}{render(width/2)}<Wall position={[0,wallHeight/2,depth/2]} args={[width,wallHeight,.38]} material={material}/></>
}

function Gable({config,z,material}:{config:GarageConfig;z:number;material:THREE.Material}){
  const {width,wallHeight}=config.dimensions, rise=roofRise(width,config.roof.pitch)
  const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-width/2,wallHeight,0,width/2,wallHeight,0,0,wallHeight+rise-.03,0]),3));g.computeVertexNormals();return g},[width,wallHeight,rise])
  return <mesh geometry={geometry} material={material} position={[0,0,z]} castShadow receiveShadow/>
}

function Roof({config}:{config:GarageConfig}){
  const {width,depth,wallHeight}=config.dimensions
  const overhang=.72
  const rise=roofRise(width,config.roof.pitch)
  const run=width/2+overhang
  const angle=pitchAngle(config.roof.pitch)
  const panelLength=roofPanelLength(width,config.roof.pitch,overhang)
  const material=useRoofMaterial(config.roof.material)
  const gableMaterial=useSidingMaterial(config.siding.color,config.siding.type,THREE.DoubleSide)
  const trim=trimMap[config.trim.color], metal=metalMap[config.trim.color]
  // Each roof plane is centered exactly halfway between its eave and ridge.
  // This keeps the roof locked to the wall geometry when width or pitch changes.
  const panelY=wallHeight+rise/2
  const panelZ=0
  const roofDepth=depth+overhang*2
  return <group>
    <mesh position={[-run/2,panelY,panelZ]} rotation={[0,0,angle]} material={material} castShadow receiveShadow><boxGeometry args={[panelLength,.22,roofDepth]}/></mesh>
    <mesh position={[run/2,panelY,panelZ]} rotation={[0,0,-angle]} material={material} castShadow receiveShadow><boxGeometry args={[panelLength,.22,roofDepth]}/></mesh>
    <Box args={[.38,.30,depth+overhang*2+.06]} position={[0,wallHeight+rise+.04,0]} color={trim} roughness={.42}/>
    <Box args={[.25,.28,depth+overhang*2]} position={[-width/2-overhang*.68,wallHeight-.05,0]} color={metal} roughness={.38} metalness={.25}/>
    <Box args={[.25,.28,depth+overhang*2]} position={[width/2+overhang*.68,wallHeight-.05,0]} color={metal} roughness={.38} metalness={.25}/>
    <Box args={[.72,.10,depth+overhang*1.7]} position={[-width/2-.04,wallHeight-.19,0]} color="#e6e2d8" roughness={.8}/>
    <Box args={[.72,.10,depth+overhang*1.7]} position={[width/2+.04,wallHeight-.19,0]} color="#e6e2d8" roughness={.8}/>
    {config.options.gutters&&<>
      <Box args={[.28,.24,depth+overhang*2+.12]} position={[-width/2-overhang*.86,wallHeight-.25,0]} color={metal} roughness={.29} metalness={.58}/>
      <Box args={[.28,.24,depth+overhang*2+.12]} position={[width/2+overhang*.86,wallHeight-.25,0]} color={metal} roughness={.29} metalness={.58}/>
      <Box args={[.18,Math.min(4.2,wallHeight*.46),.18]} position={[-width/2-overhang*.86,wallHeight/2-.18,-depth/2-overhang*.72]} color={metal} roughness={.29} metalness={.58}/>
      <Box args={[.18,Math.min(4.2,wallHeight*.46),.18]} position={[width/2+overhang*.86,wallHeight/2-.18,depth/2+overhang*.72]} color={metal} roughness={.29} metalness={.58}/>
    </>}
    <Gable config={config} z={-(depth/2+.02)} material={gableMaterial}/><Gable config={config} z={depth/2+.02} material={gableMaterial}/>
    <RoofStructure config={config} />
    {config.options.attic&&<AtticVent config={config}/>} 
  </group>
}

function RoofStructure({config}:{config:GarageConfig}){
  const {width,depth,wallHeight}=config.dimensions
  const overhang=.72
  const rise=roofRise(width,config.roof.pitch)
  const angle=pitchAngle(config.roof.pitch)
  const trim=trimMap[config.trim.color]
  const rafterCount=Math.max(7,Math.min(18,Math.round(depth/4)+1))
  const spacing=depth/(rafterCount-1)
  return <group>
    {Array.from({length:rafterCount},(_,i)=>{
      const z=-depth/2+i*spacing
      const rafterLength=roofPanelLength(width,config.roof.pitch,overhang)
      return <group key={i}>
        <Box args={[rafterLength,.18,.14]} position={[-(width/4+overhang/2),wallHeight+rise/2,z]} rotation={[0,0,angle]} color={trim} roughness={.58} castShadow={false}/>
        <Box args={[rafterLength,.18,.14]} position={[(width/4+overhang/2),wallHeight+rise/2,z]} rotation={[0,0,-angle]} color={trim} roughness={.58} castShadow={false}/>
      </group>
    })}
  </group>
}

function AtticVent({config}:{config:GarageConfig}){
  const rise=roofRise(config.dimensions.width,config.roof.pitch), y=config.dimensions.wallHeight+Math.min(rise*.5,3.2), z=-config.dimensions.depth/2-.08, trim=trimMap[config.trim.color]
  return <group position={[0,y,z]}><Box args={[2.7,1.05,.15]} position={[0,0,0]} color={trim} roughness={.5}/><Box args={[2.3,.64,.09]} position={[0,-.04,-.10]} color="#1c2122" roughness={.62} metalness={.12}/>{[-.72,-.24,.24,.72].map(x=><Box key={x} args={[.07,.5,.07]} position={[x,-.03,-.16]} color="#87827a" roughness={.55}/>)}</group>
}

function ExteriorLighting({config}:{config:GarageConfig}){
  if(!config.options.electrical)return null
  const trim=trimMap[config.trim.color], z=-config.dimensions.depth/2-.36, y=config.door.height+1.45
  return <group><Box args={[.58,.2,.16]} position={[0,y,z]} color={trim} roughness={.3} metalness={.4}/><mesh position={[0,y-.14,z-.12]}><sphereGeometry args={[.11,16,16]}/><meshStandardMaterial color="#ffdca4" emissive="#ffad55" emissiveIntensity={2.4}/></mesh><pointLight position={[0,y-.2,z-.3]} intensity={5.5} distance={11} decay={2} color="#ffd7a0"/></group>
}

function UtilityDetails({config}:{config:GarageConfig}){
  if(!config.options.electrical)return null
  const x=config.dimensions.width/2+.22
  return <group position={[x,1.8,config.dimensions.depth*.12]}><Box args={[.12,1.15,.78]} position={[0,0,0]} color="#d2d0c8" roughness={.66}/><Box args={[.05,.84,.54]} position={[.08,0,0]} color="#92938f" roughness={.55} metalness={.2}/><Box args={[.02,.12,.32]} position={[.12,.22,0]} color="#3f4544" roughness={.28} metalness={.45}/></group>
}

function CornerTrim({config}:{config:GarageConfig}){
  const {width,depth,wallHeight}=config.dimensions, trim=trimMap[config.trim.color]
  return <group>{[-width/2,width/2].flatMap(x=>[-depth/2,depth/2].map(z=><Box key={`${x}-${z}`} args={[.28,wallHeight+.08,.28]} position={[x,wallHeight/2,z]} color={trim} roughness={.43}/>))}</group>
}

export function GarageModel(){
  const config=useGarageStore(s=>s.config)
  const concrete=useConcreteMaterial(), siding=useSidingMaterial(config.siding.color,config.siding.type)
  return <group>
    <Foundation config={config} concrete={concrete}/>
    <SideWalls config={config} material={siding}/>
    <FrontWall config={config} material={siding}/>
    <Door config={config}/><Windows config={config}/><CornerTrim config={config}/><Roof config={config}/><ExteriorLighting config={config}/><UtilityDetails config={config}/>
  </group>
}
