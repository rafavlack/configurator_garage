# Changelog

## 1.3.1
- Fixed the camera reset/zoom regression when changing any configurator option.
- Camera position is now initialized once per scene instead of being recalculated on every configuration render.
- Camera view presets are only applied when the user explicitly changes the view.
- OrbitControls target is stable during material, dimension, door, window and option changes.
- Changing garage dimensions no longer automatically reframes the camera.


## 1.3.0 — 2026-09-27

- Reworked the construction-cost estimator around published 2026 market ranges instead of arbitrary fixed add-ons.
- Added transparent cost line items and an expandable estimate breakdown.
- Added documented pricing sources and methodology in `PRICING_SOURCES.md`.
- Corrected roof-plane placement so both slopes remain anchored to the wall/eave and ridge geometry as width and pitch change.
- Added lightweight parametric roof framing members.
- Improved material descriptions to distinguish visual selection from code compliance.
- Retained exact dependency versions and TypeScript 5.9.3.
