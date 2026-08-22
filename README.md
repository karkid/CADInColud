# CADInColud

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Browser-based CAD viewer for DXF drawings — parses raw DXF geometry and renders it in an interactive 3D scene with Three.js. Built to explore whether a CAD engine could run "Anyplace, Anywhere, Anytime," in a browser tab instead of a native application.

## What this demonstrates
- A DXF parser built entity-by-entity from the file format spec (lines, arcs, circles, polylines, splines, text, dimensions, inserts, …)
- A vectorizer converting parsed DXF entities into renderable geometry
- A Three.js viewer with orbit camera controls
- ~12 years of CAD/computational-geometry background applied to a from-scratch 2D/3D geometry pipeline

## Tech stack
JavaScript (ES6/Babel) · Three.js · Webpack

## Setup
```bash
npm install
npm run dev      # webpack-dev-server, live reload
npm run build:prod
```

## Structure
```
lib/parsers/dxf/         DXF format parsing (per-entity)
lib/engine/vectorizer/   DXF entities → renderable geometry
lib/engine/viewer/       Three.js scene + orbit camera controller
```

## Demo
*(a screenshot or short GIF of the viewer loading a DXF file — highest-impact thing missing from this repo)*
