import fs from 'node:fs';
import path from 'node:path';

const outputDirectory = path.resolve('out');
const scriptDirectory = path.resolve('scripts', 'dist');

for (const filename of ['background.js', 'content.js']) {
  fs.copyFileSync(path.join(scriptDirectory, filename), path.join(outputDirectory, filename));
}

fs.copyFileSync(path.resolve('public', 'manifest.json'), path.join(outputDirectory, 'manifest.json'));

const nextOutputDirectory = path.join(outputDirectory, '_next');
const assetDirectory = path.join(outputDirectory, 'assets');
if (!fs.existsSync(nextOutputDirectory)) {
  throw new Error(`Next.js build assets are missing: ${nextOutputDirectory}`);
}
fs.renameSync(nextOutputDirectory, assetDirectory);

for (const filename of [
  '_not-found',
  '_not-found.html',
  '_not-found.txt',
  '__next._full.txt',
  '__next._tree.txt',
  '__next.__PAGE__.txt',
]) {
  fs.rmSync(path.join(outputDirectory, filename), { force: true, recursive: true });
}

function removeNextManifests(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      removeNextManifests(entryPath);
    } else if (
      ['_buildManifest.js', '_clientMiddlewareManifest.js', '_ssgManifest.js'].includes(entry.name)
    ) {
      fs.rmSync(entryPath);
    }
  }
}

removeNextManifests(assetDirectory);

function updateNextAssetPaths(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      updateNextAssetPaths(entryPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;

    const source = fs.readFileSync(entryPath, 'utf8');
    const updated = source.replaceAll('./_next/', './assets/').replaceAll('/_next/', '/assets/');
    if (updated !== source) fs.writeFileSync(entryPath, updated, 'utf8');
  }
}

updateNextAssetPaths(assetDirectory);

let inlineScriptNumber = 0;

function externalizeInlineScripts(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      externalizeInlineScripts(entryPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    let html = fs.readFileSync(entryPath, 'utf8');
    html = html.replaceAll('./_next/', './assets/').replaceAll('/_next/', '/assets/');
    const htmlDirectory = path.dirname(entryPath);
    html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attributes, source) => {
      if (/\bsrc\s*=/i.test(attributes) || !source.trim()) return tag;

      inlineScriptNumber += 1;
      const filename = `extension-inline-${inlineScriptNumber}.js`;
      const scriptPath = path.join(htmlDirectory, filename);
      fs.writeFileSync(scriptPath, source, 'utf8');

      let relativePath = path.relative(htmlDirectory, scriptPath).split(path.sep).join('/');
      if (!relativePath.startsWith('.')) relativePath = `./${relativePath}`;
      return `<script${attributes} src="${relativePath}"></script>`;
    });
    fs.writeFileSync(entryPath, html, 'utf8');
  }
}

function assertNoReservedNames(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) {
      throw new Error(`Chrome reserves filenames beginning with "_": ${path.join(directory, entry.name)}`);
    }
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      assertNoReservedNames(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      const source = fs.readFileSync(entryPath, 'utf8');
      if (source.includes('./_next/') || source.includes('/_next/')) {
        throw new Error(`Next.js asset path was not updated in ${entryPath}`);
      }
    }
  }
}

externalizeInlineScripts(outputDirectory);

const manifest = JSON.parse(fs.readFileSync(path.join(outputDirectory, 'manifest.json'), 'utf8'));
for (const iconPath of Object.values(manifest.icons)) {
  if (!fs.existsSync(path.join(outputDirectory, iconPath))) {
    throw new Error(`Chrome extension icon is missing: ${iconPath}`);
  }
}
for (const filename of ['index.html', 'background.js', 'content.js']) {
  if (!fs.existsSync(path.join(outputDirectory, filename))) {
    throw new Error(`Chrome extension build output is missing: ${filename}`);
  }
}

assertNoReservedNames(outputDirectory);

for (const entry of fs.readdirSync(outputDirectory, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const html = fs.readFileSync(path.join(outputDirectory, entry.name), 'utf8');
  if (/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?\S[\s\S]*?<\/script>/i.test(html)) {
    throw new Error(`Inline script remains in ${entry.name}; Chrome's extension CSP would block it.`);
  }
}

console.log(`Packaged Chrome extension in ${outputDirectory} with ${inlineScriptNumber} CSP-safe scripts.`);
