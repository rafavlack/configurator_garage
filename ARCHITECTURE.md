# Architecture

## Source of truth

`GarageConfig` is the authoritative representation of a design.

## Render path

```text
GarageConfig
  ├── geometry
  ├── 3D materials
  ├── UI selections
  ├── estimate
  ├── share URL
  └── quote payload
```

## 3D design approach

The structure is generated parametrically rather than storing one enormous model for every possible garage size. Doors, windows, trims and small visual assemblies are componentized. Procedural PBR-style textures are generated at runtime for siding, roof and concrete so the starter project does not depend on a large external asset pack.

## Production asset upgrade

For the final TGB release, the procedural materials can be replaced by licensed high-resolution PBR textures and optimized GLB components without changing the `GarageConfig` API or the configurator UI.
