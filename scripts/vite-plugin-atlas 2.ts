// @ts-expect-error type error without @types/node package
import { cp, readdir, stat } from "node:fs/promises";
// @ts-expect-error type error without @types/node package
import { createReadStream } from "node:fs";
// @ts-expect-error type error without @types/node package
import { extname, join, normalize, resolve } from "node:path";

/**
 * Liefert die Atlas-Geometrie aus `content/atlas/` unter `/atlas/` aus.
 *
 * Warum ein eigenes Plugin und nicht `public/`: die Daten liegen unter
 * `content/`, weil beide Apps sie lesen. Eine Kopie in `public/` wären 97 MB
 * doppelt im Repository, ein Symlink funktioniert unter Windows nicht
 * verlässlich.
 *
 * Im Entwicklungsbetrieb geht das über eine Middleware, beim Bauen wird
 * kopiert. Danach steht der Atlas im Frontend-Bündel, und Tauri bettet ihn
 * in die native Bibliothek ein. Das ist derselbe Weg, den schon die 49
 * Abbildungen nehmen, und der einzige, der auf Android ohne Plattformcode
 * funktioniert: gebündelte Tauri-Ressourcen landen dort zwar im APK, sind
 * aber weder über `std::fs` noch über das Asset-Protokoll erreichbar, weil
 * APK-Assets keine Dateien im Dateisystem sind.
 */

const TYPES: Record<string, string> = {
  ".json": "application/json",
  ".bin": "application/octet-stream",
};

export function atlasAssets(contentDir: string) {
  const source = resolve(contentDir, "atlas");

  return {
    name: "sanwissen-atlas",

    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = (req.url ?? "").split("?")[0];
        if (!url.startsWith("/atlas/")) return next();

        // `normalize` allein reicht nicht: ein führendes `..` überlebt es.
        const relative = normalize(decodeURIComponent(url.slice("/atlas/".length)));
        if (relative.startsWith("..") || relative.includes("\0")) {
          res.statusCode = 400;
          return res.end();
        }

        const file = join(source, relative);
        stat(file).then(
          () => {
            res.setHeader("Content-Type", TYPES[extname(file)] ?? "application/octet-stream");
            createReadStream(file).pipe(res);
          },
          () => next(),
        );
      });
    },

    async closeBundle() {
      const target = resolve(contentDir, "..", "dist", "atlas");
      await cp(source, target, { recursive: true });
      const files = await readdir(target);
      let bytes = 0;
      for (const f of files) bytes += (await stat(join(target, f))).size;
      console.log(`  Atlas: ${files.length} Dateien, ${(bytes / 1e6).toFixed(0)} MB nach dist/atlas/`);
    },
  };
}
