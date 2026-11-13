# Blocksmith NBT Workbench

Client-side Minecraft NBT editor with standard tag support, gzip import where the browser supports `DecompressionStream`, drag-and-drop, expandable compounds, search, undo/redo, BigInt-safe Long handling, and export. Data never leaves the browser.

## Run locally

```sh
python3 -m http.server 4173
```

Open http://localhost:4173.

## Test

```sh
npm test
```

The test verifies parse → serialize byte equality for a compound containing Int, Long, and String tags, including a Long beyond JavaScript’s safe integer range. Export emits uncompressed NBT, which Minecraft accepts.
