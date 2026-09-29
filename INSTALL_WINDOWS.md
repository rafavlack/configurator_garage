# Windows installation

Requirements: Node.js 20.19+ (Node 22 LTS is recommended).

```powershell
npm install
npm run check:structure
npm run typecheck
npm run dev
```

Production build:

```powershell
npm run build
```

The previous package referenced `typescript@5.9.0`, which is not a published stable npm release. This version uses `typescript@5.9.3`.
