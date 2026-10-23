import { chromium } from "/home/fenix/code/worktrees/t3code.agent-artifact-browser-padding/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core/index.js";
import { readdirSync, readFileSync } from "node:fs";
const pr = await import("/home/fenix/code/worktrees/t3code.agent-artifact-browser-padding/packages/shared/src/htmlRender.ts");
const dir = "/tmp/inline-proof/agent-eval/out";
const files = readdirSync(dir).filter((f) => f.endsWith(".html")).sort();
const pages: Record<string,string> = {};
for (const f of files) pages["/"+f] = pr.injectHtmlRenderBootstrap(readFileSync(`${dir}/${f}`, "utf8"));
const srv = Bun.serve({ port: 0, fetch: (r) => new Response(pages[new URL(r.url).pathname] ?? "404", { headers: { "content-type": "text/html", "content-security-policy": "sandbox allow-scripts" } }) });
const b = await chromium.launch({ executablePath: "/home/fenix/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell" });
const rows: any[] = [];
for (const f of files) {
  const src = readFileSync(`${dir}/${f}`, "utf8");
  const static_ = {
    vw: /\b\d*\.?\d+\s*(?:vw|dvw|svw|lvw)\b/i.test(src.replace(/<script[\s\S]*?<\/script>/gi, "")) || /\b(?:vw|dvw)\b/.test(src),
    innerWidth: /innerWidth/.test(src),
    htmlPad0: /(?:^|[,}\s])(?:html|:root)\s*(?:,[^{]*)?\{[^}]*padding\s*:\s*0(?![.\d])/i.test(src) || /<html[^>]*style=["'][^"']*padding\s*:\s*0/i.test(src),
  };
  const m: Record<string, number> = {};
  for (const w of [360, 728, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 400 } });
    await p.goto(`http://localhost:${srv.port}/${f}`); await p.waitForTimeout(500);
    const r = await p.evaluate(() => { const e = document.documentElement; return { ovf: e.scrollWidth - e.clientWidth, pad: getComputedStyle(e).paddingLeft }; });
    m[`ovf${w}`] = r.ovf; if (w === 728) { (m as any).pad = r.pad; await p.screenshot({ path: `/tmp/inline-proof/agent-eval/shots/${f}.png` }); }
    await p.close();
  }
  rows.push({ f, ...static_, ...m });
}
console.table(rows);
for (const v of ["v0", "v2"]) { const r = rows.filter((x) => x.f.startsWith(v)); console.log(v, "n", r.length, "uses vw", r.filter((x)=>x.vw).length, "innerWidth", r.filter((x)=>x.innerWidth).length, "html padding:0", r.filter((x)=>x.htmlPad0).length, "overflow@728", r.filter((x)=>x.ovf728>0).length, "overflow@360", r.filter((x)=>x.ovf360>0).length, "overflow@1280", r.filter((x)=>x.ovf1280>0).length); }
await b.close(); srv.stop();
