import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { transform } from "esbuild";
import { minify } from "html-minifier-terser";

const root = process.cwd();
const output = resolve(root, "dist");
const publicPaths = [
    ["index.html", "index.html"],
    ["trang-chu.html", "trang-chu.html"],
    ["dang-nhap.html", "dang-nhap.html"],
    ["gioi-thieu.html", "gioi-thieu.html"],
    ["so-thich.html", "so-thich.html"],
    ["blog.html", "blog.html"],
    ["ky-niem.html", "ky-niem.html"],
    ["lien-he.html", "lien-he.html"],
    ["mang-xa-hoi.html", "mang-xa-hoi.html"],
    ["media", "media"],
    ["partials", "partials"],
    ["style.css", "style.css"],
    ["space.js", "space.js"],
    ["script.js", "script.js"],
    ["auth.js", "auth.js"],
    ["partials.js", "partials.js"]
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const [sourcePath, outputPath] of publicPaths) {
    await cp(join(root, sourcePath), join(output, outputPath), { recursive: true });
}

async function minifyFiles(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            await minifyFiles(path);
            continue;
        }

        const source = await readFile(path, "utf8");
        const extension = extname(path);
        if (extension === ".html") {
            const result = await minify(source, {
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                minifyJS: true
            });
            await writeFile(path, result);
        } else if (extension === ".js" || extension === ".css") {
            const result = await transform(source, {
                loader: extension.slice(1),
                minify: true,
                legalComments: "none"
            });
            await writeFile(path, result.code);
        }
    }
}

await minifyFiles(output);
console.log(`Built public site into ${output}`);
