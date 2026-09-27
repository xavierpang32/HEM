import { mkdirSync, rmSync, writeFileSync } from "node:fs";

// The old /HEM/ address is stuck as "already installed" in Chrome.
// Serve the app from /HEM/app/ and turn the old address into a plain redirect.
mkdirSync("docs", { recursive: true });
for (const stale of [
  "docs/manifest.json",
  "docs/service-worker.js",
  "docs/sw.js",
  "docs/icon-192.png",
  "docs/icon-512.png",
  "docs/icon-maskable-512.png",
  "docs/favicon.svg",
  "docs/assets",
  "docs/__grok",
]) {
  rmSync(stale, { recursive: true, force: true });
}
writeFileSync("docs/.nojekyll", "");
writeFileSync(
  "docs/index.html",
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hem</title>
    <meta http-equiv="refresh" content="0; url=./app/" />
  </head>
  <body>
    <script>
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (regs) {
          return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
        }).finally(go);
      } else {
        go();
      }
      function go() { location.replace("./app/"); }
    </script>
  </body>
</html>
`,
);
