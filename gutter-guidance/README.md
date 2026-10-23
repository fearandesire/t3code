Evidence for pingdotgg/t3code#23845, layout guidance commit 5f927bbca3.

- `fig-viewport-units.png`, `fig-padding-resets.png`: standalone page, 728px viewport, headless Chromium.
- `harness/cases.ts` + `run.ts`: 33 CSS cases x 5 hosts (iframe 728, top-level with theme fragment 728, standalone 360/728/1280) x 2 builds (main, PR). `results.json` is the raw output.
- `harness/analyze.ts`, `agent-pages/`: 12 pages written by Sonnet 5.5 subagents from the old (v0) and new (v2) tool descriptions in `tool-v0.txt` / `tool-v2.txt`, measured standalone at 360/728/1280.
