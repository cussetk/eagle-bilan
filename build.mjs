// Construit le site statique dans dist/ : copie static/, assemble et regroupe le code (avec le SDK Neon), copie les polices et html2pdf.
import { build } from "esbuild";
import fs from "node:fs";
fs.rmSync("dist", { recursive: true, force: true });
fs.cpSync("static", "dist", { recursive: true });
const parts = ["a_core", "b_bilan", "c_views", "d_settings", "e_main"].map((f) => fs.readFileSync(`src/${f}.js`, "utf8"));
fs.writeFileSync("src/_app.js", parts.join("\n"));
const opts = { bundle: true, minify: true, format: "iife", target: "es2019", logLevel: "warning" };
await build({ ...opts, entryPoints: ["src/_app.js"], outfile: "dist/app.js" });
await build({ ...opts, entryPoints: ["src/rapport.js"], outfile: "dist/r/r.js" });
fs.mkdirSync("dist/fonts", { recursive: true });
const A = "node_modules/@fontsource-variable/archivo/files/", F = "node_modules/@fontsource/figtree/files/";
fs.copyFileSync(A + "archivo-latin-wdth-normal.woff2", "dist/fonts/archivo-wdth.woff2");
fs.copyFileSync(A + "archivo-latin-ext-wdth-normal.woff2", "dist/fonts/archivo-wdth-ext.woff2");
for (const w of [400, 500, 600, 700, 800]) {
  fs.copyFileSync(`${F}figtree-latin-${w}-normal.woff2`, `dist/fonts/figtree-${w}.woff2`);
  fs.copyFileSync(`${F}figtree-latin-ext-${w}-normal.woff2`, `dist/fonts/figtree-ext-${w}.woff2`);
}
fs.copyFileSync("node_modules/html2pdf.js/dist/html2pdf.bundle.min.js", "dist/html2pdf.bundle.min.js");
console.log("Build OK");
