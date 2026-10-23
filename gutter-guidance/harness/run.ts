import { chromium } from "/home/fenix/code/worktrees/t3code.agent-artifact-browser-padding/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core/index.js";
import { PNG } from "/home/fenix/code/worktrees/t3code.agent-artifact-browser-padding/node_modules/.pnpm/pngjs@7.0.0/node_modules/pngjs/lib/png.js";
import { cases } from "./cases.ts";
const builds = {
  main: await import("/tmp/inline-proof/before/htmlRender.ts"),
  pr: await import("/home/fenix/code/worktrees/t3code.agent-artifact-browser-padding/packages/shared/src/htmlRender.ts"),
};
const pal = await import("/home/fenix/code/worktrees/t3code.agent-artifact-browser-padding/packages/shared/src/themePalettes.ts");
const theme = builds.pr.htmlRenderThemeFragment(builds.pr.htmlRenderTheme(pal.T3_CODE_LIGHT_THEME_COLORS, "light"));
const pages: Record<string, string> = {};
for (const b of ["main", "pr"] as const) for (const c of cases) pages[`/${b}/${c.id}`] = builds[b].injectHtmlRenderBootstrap(c.html);
const csp = { "content-type": "text/html", "content-security-policy": "sandbox allow-scripts" };
const srv = Bun.serve({ port: 0, fetch: (r) => {
  const u = new URL(r.url);
  if (u.pathname === "/host") return new Response(`<!doctype html><body style="margin:0"><iframe id=f sandbox="allow-scripts allow-forms" style="border:0;width:${u.searchParams.get("w")}px;height:300px" src="${u.searchParams.get("src")}"></iframe>`, { headers: { "content-type": "text/html" } });
  return new Response(pages[u.pathname] ?? "404", { headers: csp });
} });
const exe = "/home/fenix/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browser = await chromium.launch({ executablePath: exe });
const probeJs = () => {
  const r = document.documentElement, p = document.getElementById("probe")!.getBoundingClientRect();
  return { padL: getComputedStyle(r).paddingLeft, overflowX: r.scrollWidth - r.clientWidth, probeL: Math.round(p.left), probeR: Math.round(p.right), vw: r.clientWidth };
};
const hosts = [
  { id: "iframe-728", w: 728, kind: "iframe" },
  { id: "toplevel-fragment-728", w: 728, kind: "frag" },
  { id: "standalone-728", w: 728, kind: "plain" },
  { id: "standalone-360", w: 360, kind: "plain" },
  { id: "standalone-1280", w: 1280, kind: "plain" },
] as const;
const out: any[] = [];
for (const h of hosts) for (const b of ["main", "pr"] as const) for (const c of cases) {
  const page = await browser.newPage({ viewport: { width: h.w, height: 300 } });
  const base = `http://localhost:${srv.port}`;
  let m: any, shot: Buffer;
  if (h.kind === "iframe") {
    await page.goto(`${base}/host?w=${h.w}&src=${encodeURIComponent(`${base}/${b}/${c.id}${theme}`)}`);
    await page.waitForTimeout(150);
    const f = page.frames().find((x) => x !== page.mainFrame())!;
    m = await f.evaluate(probeJs);
    shot = await page.screenshot();
  } else {
    await page.goto(`${base}/${b}/${c.id}${h.kind === "frag" ? theme : ""}`);
    await page.waitForTimeout(150);
    m = await page.evaluate(probeJs);
    shot = await page.screenshot();
  }
  if (h.id === "standalone-728" && ["w-100vw","w-pct","r-html-body","r-html","r-star","r-body","w-canvas-innerWidth","w-canvas-parent","x-bleed-exception","w-fixed-728","w-max-728"].includes(c.id)) await Bun.write(`/tmp/inline-proof/matrix/shots/${h.id}.${b}.${c.id}.png`, shot);
  out.push({ host: h.id, build: b, case: c.id, ...m, hash: Bun.hash(shot).toString(16) });
  await page.close();
}
await Bun.write("/tmp/inline-proof/matrix/results.json", JSON.stringify(out, null, 1));
await browser.close(); srv.stop();
// hosted-invariance: main vs pr identical
let bad = 0, n = 0;
for (const h of ["iframe-728", "toplevel-fragment-728"]) for (const c of cases) {
  const a = out.find((x) => x.host === h && x.build === "main" && x.case === c.id), p = out.find((x) => x.host === h && x.build === "pr" && x.case === c.id);
  n++; if (a.hash !== p.hash || a.overflowX !== p.overflowX || a.probeL !== p.probeL) { bad++; console.log("HOSTED DIFF", h, c.id, a, p); }
}
console.log(`hosted pairs compared: ${n}, differing: ${bad}`);
