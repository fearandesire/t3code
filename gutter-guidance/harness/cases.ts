export interface Case { id: string; group: string; note: string; html: string; width?: number }
const page = (css: string, body = '<div id="probe">probe</div>', htmlAttr = "") =>
  `<!doctype html><html${htmlAttr}><head><meta charset="utf-8"><style>#probe{height:36px;background:#e5484d;color:#fff;font:600 13px/36px system-ui;text-align:center;box-sizing:border-box;border-left:4px solid #111;border-right:4px solid #111}${css}</style></head><body>${body}</body></html>`;
const svg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='80'><rect width='1200' height='80' fill='%234f8cff'/></svg>";
export const cases: Case[] = [
  // Pixel point 1: viewport units vs container-relative widths
  { id: "w-pct", group: "width", note: "width:100%", html: page("#probe{width:100%}") },
  { id: "w-auto", group: "width", note: "block, no width", html: page("") },
  { id: "w-100vw", group: "width", note: "width:100vw", html: page("#probe{width:100vw}") },
  { id: "w-min-100vw", group: "width", note: "min-width:100vw", html: page("#probe{min-width:100vw}") },
  { id: "w-100dvw", group: "width", note: "width:100dvw", html: page("#probe{width:100dvw}") },
  { id: "w-100svw", group: "width", note: "width:100svw", html: page("#probe{width:100svw}") },
  { id: "w-100lvw", group: "width", note: "width:100lvw", html: page("#probe{width:100lvw}") },
  { id: "w-body-100vw", group: "width", note: "body{width:100vw}", html: page("body{width:100vw}") },
  { id: "w-html-100vw", group: "width", note: "html{width:100vw}", html: page("html{width:100vw}") },
  { id: "w-calc", group: "width", note: "width:calc(100vw - 32px)", html: page("#probe{width:calc(100vw - 32px)}") },
  { id: "w-bleed-trick", group: "width", note: "left:50%; margin-left:-50vw; width:100vw", html: page("#probe{position:relative;left:50%;margin-left:-50vw;width:100vw}") },
  { id: "w-fixed-728", group: "width", note: "width:728px (column width)", html: page("#probe{width:728px}") },
  { id: "w-max-728", group: "width", note: "max-width:728px", html: page("#probe{max-width:728px}") },
  { id: "w-position-fixed", group: "width", note: "position:fixed; inset:0 (overlay)", html: page("#probe{position:fixed;inset:0;height:auto}") },
  { id: "w-position-absolute", group: "width", note: "position:absolute; left:0; right:0", html: page("#probe{position:absolute;left:0;right:0;top:0}") },
  { id: "w-img-100", group: "width", note: "img width:100%", html: page("img{display:block;width:100%}", `<div id="probe">probe</div><img src="${svg}">`) },
  { id: "w-canvas-innerWidth", group: "width", note: "canvas.width = innerWidth", html: page("canvas{display:block}", '<div id="probe"><canvas id="c" height="20"></canvas></div><script>c.width=innerWidth</script>') },
  { id: "w-canvas-parent", group: "width", note: "canvas.width = parent.clientWidth", html: page("canvas{display:block}", '<div id="probe"><canvas id="c" height="20"></canvas></div><script>c.width=c.parentElement.clientWidth</script>') },
  { id: "w-table-wrapped", group: "width", note: "wide table inside overflow-x:auto", html: page("table{min-width:900px}", '<div id="probe" style="overflow-x:auto;height:auto"><table><tr><td>wide</td></tr></table></div>') },
  { id: "w-table-bare", group: "width", note: "wide table, no wrapper (control)", html: page("table{min-width:900px}", '<div id="probe" style="height:auto"><table><tr><td>wide</td></tr></table></div>') },
  // Pixel point 2: html padding override, and look-alike resets
  { id: "r-none", group: "reset", note: "no reset", html: page("") },
  { id: "r-star", group: "reset", note: "*{margin:0;padding:0}", html: page("*{margin:0;padding:0}") },
  { id: "r-html-body", group: "reset", note: "html,body{margin:0;padding:0}", html: page("html,body{margin:0;padding:0}") },
  { id: "r-html", group: "reset", note: "html{padding:0}", html: page("html{padding:0}") },
  { id: "r-root", group: "reset", note: ":root{padding:0}", html: page(":root{padding:0}") },
  { id: "r-body", group: "reset", note: "body{padding:0}", html: page("body{padding:0}") },
  { id: "r-html-important", group: "reset", note: "html{padding:0!important}", html: page("html{padding:0!important}") },
  { id: "r-html-inline", group: "reset", note: '<html style="padding:0">', html: page("", undefined, ' style="padding:0"') },
  { id: "r-html-margin", group: "reset", note: "html{margin:0}", html: page("html{margin:0}") },
  { id: "r-body-padding", group: "reset", note: "body{padding:24px}", html: page("body{padding:24px}") },
  { id: "r-box-content", group: "reset", note: "html{box-sizing:content-box;width:100%}", html: page("html{box-sizing:content-box;width:100%}") },
  { id: "x-bleed-exception", group: "exception", note: "html{padding:0} + width:100vw (the documented exception)", html: page("html{padding:0}#probe{width:100vw}") },
  { id: "x-bleed-no-exception", group: "exception", note: "width:100vw alone", html: page("#probe{width:100vw}") },
];
