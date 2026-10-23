import { chromium } from "/home/fenix/code/worktrees/t3code.agent-artifact-browser-padding/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core/index.js";
import { readFileSync } from "node:fs";
const r = JSON.parse(readFileSync("/tmp/inline-proof/matrix/results.json", "utf8"));
const m = (host: string, b: string, c: string) => r.find((x: any) => x.host === host && x.build === b && x.case === c);
const img = (b: string, c: string) => "data:image/png;base64," + readFileSync(`/tmp/inline-proof/matrix/shots/standalone-728.${b}.${c}.png`).toString("base64");
type P = { b: string; c: string; title: string; css: string; verdict: "ok" | "bad" | "note" };
const fig = (title: string, sub: string, panels: P[]) => `<!doctype html><meta charset=utf-8><body style="margin:0;background:#fff;font:14px/1.45 system-ui,sans-serif;color:#14161a;padding:22px;width:1500px;box-sizing:border-box">
<h2 style="margin:0 0 2px;font-size:20px">${title}</h2><p style="margin:0 0 16px;color:#555">${sub}</p>
<div style="display:grid;grid-template-columns:repeat(${panels.length},1fr);gap:16px">${panels.map((p) => { const x = m("standalone-728", p.b, p.c); const col = p.verdict === "bad" ? "#d1242f" : p.verdict === "ok" ? "#1a7f37" : "#57606a";
  return `<div><div style="font-weight:650;margin-bottom:2px">${p.title}</div><code style="font-size:12px;color:#444">${p.css}</code>
  <div style="margin:8px 0 6px;border:1px solid #c9ced6;line-height:0;height:46px;overflow:hidden"><img src="${img(p.b, p.c)}" style="width:100%;display:block"></div>
  <div style="font-size:13px;color:${col};font-weight:600">${x.overflowX > 0 ? `overflows by ${x.overflowX}px` : "no horizontal overflow"} · content ${x.probeL}–${x.probeR} of ${x.vw}px · html padding ${x.padL}</div></div>`; }).join("")}</div>
<p style="margin:14px 0 0;color:#666;font-size:12.5px">Red bar = test element with 4px black end caps; a missing right cap means the element runs past the viewport. Standalone page, 728px viewport, headless Chromium.</p>`;
const figs: Record<string, string> = {
  "fig-viewport-units": fig("Viewport units overflow the standalone gutter; container-relative widths do not", "Same markup on main and on this PR, opened on its own (no host).", [
    { b: "main", c: "w-100vw", title: "main", css: "width:100vw", verdict: "note" },
    { b: "pr", c: "w-100vw", title: "PR", css: "width:100vw", verdict: "bad" },
    { b: "pr", c: "w-pct", title: "PR", css: "width:100%", verdict: "ok" },
    { b: "pr", c: "w-canvas-innerWidth", title: "PR", css: "canvas.width = innerWidth", verdict: "bad" },
    { b: "pr", c: "w-canvas-parent", title: "PR", css: "canvas.width = parent.clientWidth", verdict: "ok" },
  ]),
  "fig-padding-resets": fig("Which resets cancel the gutter", "Standalone page on this PR. The guide now names the forms that remove it.", [
    { b: "pr", c: "r-html", title: "removes gutter", css: "html{padding:0}", verdict: "note" },
    { b: "pr", c: "r-html-body", title: "removes gutter", css: "html,body{margin:0;padding:0}", verdict: "bad" },
    { b: "pr", c: "r-star", title: "keeps gutter", css: "*{margin:0;padding:0}", verdict: "ok" },
    { b: "pr", c: "r-body", title: "keeps gutter", css: "body{padding:0}", verdict: "ok" },
    { b: "pr", c: "x-bleed-exception", title: "the exception, working", css: "html{padding:0} + width:100vw", verdict: "ok" },
  ]),
};
const b = await chromium.launch({ executablePath: "/home/fenix/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell" });
for (const [name, html] of Object.entries(figs)) { const p = await b.newPage({ viewport: { width: 1500, height: 200 }, deviceScaleFactor: 2 }); await p.setContent(html); await p.screenshot({ path: `/tmp/inline-proof/matrix/${name}.png`, fullPage: true }); await p.close(); }
await b.close();
