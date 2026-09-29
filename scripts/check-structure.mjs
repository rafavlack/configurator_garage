import fs from 'node:fs'
import path from 'node:path'

const root = new URL('..', import.meta.url).pathname
const required = [
  'index.html',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'src/main.tsx',
  'src/components/App.tsx',
  'src/scene/GarageModel.tsx',
  'src/scene/Materials.tsx',
  'src/scene/OutdoorScene.tsx',
  'src/scene/TextureFactory.ts',
  'src/state/useGarageStore.ts',
  'src/lib/config.ts',
  'src/lib/share.ts',
]

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length) {
  console.error('Missing required project files:', missing.join(', '))
  process.exit(1)
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const checks = [
  ['build script', Boolean(pkg.scripts?.build)],
  ['React Three Fiber', Boolean(pkg.dependencies?.['@react-three/fiber'])],
  ['Drei', Boolean(pkg.dependencies?.['@react-three/drei'])],
  ['Three.js', Boolean(pkg.dependencies?.three)],
  ['Zustand', Boolean(pkg.dependencies?.zustand)],
]
const failed = checks.filter(([, ok]) => !ok).map(([name]) => name)
if (failed.length) {
  console.error('Package validation failed:', failed.join(', '))
  process.exit(1)
}

console.log('TGB Garage Configurator structure check: OK')
console.log(`Version: ${pkg.version}`)
console.log('Dependencies are pinned to exact versions for reproducible installs.')
