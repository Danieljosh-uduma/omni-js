#!/usr/bin/env node

import esbuild from 'esbuild';
import { omniEsbuildPlugin, compileStats } from '../src/plugin.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { performance } from 'perf_hooks';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'build') {
  const entry = args[1] || 'src/index.omni';
  const outdirArg = args.find((a) => a.startsWith('--outdir=')) || '--outdir=dist';
  const outdir = outdirArg.split('=')[1];

  console.log(`Building ${entry} to ${outdir}...`);
  compileStats.reset();
  const startTime = performance.now();

  esbuild
    .build({
      entryPoints: [entry],
      bundle: true,
      outdir: outdir,
      plugins: [omniEsbuildPlugin],
      format: 'esm',
      minify: true,
      treeShaking: true,
    })
    .then(() => {
      const duration = performance.now() - startTime;
      console.log(`\n✨ JS Bundle complete in ${duration.toFixed(2)}ms!`);
      console.log(`📦 Compiled ${compileStats.count} .omni components.`);

      // Statically prepare index.html and output.css for deployment
      try {
        const indexHtmlPath = path.join(process.cwd(), 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          let html = fs.readFileSync(indexHtmlPath, 'utf8');
          // Remove dev mode scripts
          html = html.replace(/<script[^>]*src=["'].*?omni-runtime\.js["'][^>]*><\/script>/gi, '');
          html = html.replace(/<script[^>]*src=["'].*?vendor\.js["'][^>]*><\/script>/gi, '');
          html = html.replace(/<script[^>]*src=["'].*?fuse-browser\.js["'][^>]*><\/script>/gi, '');

          // Rewrite the type="text/omni" script to a standard bundle mount
          html = html.replace(
            /<script[^>]*type=["']text\/omni["'][^>]*src=["'](.*?)["'][^>]*><\/script>/gi,
            `<div id="omni-root"></div>\n  <script type="module">\n    import mount from '/App.js';\n    mount(document.getElementById('omni-root'));\n  </script>`
          );

          // Ensure outdir directory exists
          if (!fs.existsSync(outdir)) {
            fs.mkdirSync(outdir, { recursive: true });
          }

          fs.writeFileSync(path.join(outdir, 'index.html'), html, 'utf8');
          console.log('Production index.html generated successfully.');
        }

        const cssPath = path.join(process.cwd(), 'output.css');
        if (fs.existsSync(cssPath)) {
          fs.copyFileSync(cssPath, path.join(outdir, 'output.css'));
          console.log('Production output.css copied successfully.');
        }

        // Measure file sizes
        const jsPath = path.join(process.cwd(), outdir, 'App.js');
        const cssOutPath = path.join(process.cwd(), outdir, 'output.css');

        console.log('\n📊 Output Assets:');
        if (fs.existsSync(jsPath)) {
          const jsSize = fs.statSync(jsPath).size;
          console.log(`   - App.js:      ${(jsSize / 1024).toFixed(2)} KB (${jsSize} bytes)`);
        }
        if (fs.existsSync(cssOutPath)) {
          const cssSize = fs.statSync(cssOutPath).size;
          console.log(`   - output.css:  ${(cssSize / 1024).toFixed(2)} KB (${cssSize} bytes)`);
        }

        console.log(`\n🎉 Build fully optimized and ready for deployment in /${outdir}!`);
      } catch (e) {
        console.error('Post-build optimization failed:', e);
      }
    })
    .catch((err) => {
      console.error('Build failed', err);
      process.exit(1);
    });
} else if (command === 'create') {
  const projectName = args[1];
  if (!projectName) {
    console.error('Please specify a project name: omni create <project-name>');
    process.exit(1);
  }
  const projectDir = path.join(process.cwd(), projectName);
  if (fs.existsSync(projectDir)) {
    console.error(`Directory ${projectName} already exists.`);
    process.exit(1);
  }

  try {
    fs.mkdirSync(projectDir, { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });

    // Copy omni-runtime.js statically during project creation
    const require = createRequire(import.meta.url);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    let runtimePath;
    try {
      runtimePath = require.resolve('@omni/runtime/dist/omni-runtime.js');
    } catch {
      // Fallback for monorepo development
      runtimePath = path.resolve(__dirname, '../../runtime/dist/omni-runtime.js');
    }

    if (fs.existsSync(runtimePath)) {
      fs.copyFileSync(runtimePath, path.join(projectDir, 'omni-runtime.js'));
      console.log('Pre-included omni-runtime.js inside project.');
    } else {
      console.warn('Warning: Could not find @omni/runtime/dist/omni-runtime.js to pre-include.');
    }

    // gitignore
    const gitignoreContent = `node_modules\ndist\noutput.css\n`;
    fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent, 'utf8');

    // package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      type: 'module',
      scripts: {
        predev:
          "node -e \"require('fs').copyFileSync('./node_modules/@omni/runtime/dist/omni-runtime.js', './omni-runtime.js')\"",
        dev: 'concurrently "tailwindcss -i ./src/input.css -o ./output.css --watch" "npx serve -s ."',
        build: 'tailwindcss -i ./src/input.css -o ./output.css --minify && omni build src/App.omni --outdir=dist',
      },
      dependencies: {
        '@omni/cli': '^1.0.0',
        '@omni/runtime': '^1.0.0',
      },
      devDependencies: {
        '@tailwindcss/cli': '^4.3.1',
        concurrently: '^10.0.3',
        tailwindcss: '^4.3.1',
      },
    };
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');

    // index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link href="/output.css" rel="stylesheet">
  <script src="/omni-runtime.js" type="module"></script>
</head>
<body class="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
  <script type="text/omni" src="./src/App.omni"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(projectDir, 'index.html'), indexHtml, 'utf8');

    // src/App.omni
    const appOmni = `<script>
  state ?count = 0;

  function increment() {
    ?count = ?count + 1;
  }

  function decrement() {
    ?count = ?count - 1;
  }
</script>

<Stack class="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
  <Text class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
    Welcome to OmniJS
  </Text>
  
  <Text class="text-zinc-600 dark:text-zinc-400 max-w-md text-center">
    Your new project is successfully initialized! Edit <code class="font-mono bg-zinc-100 dark:bg-white/10 px-1.5 py-0.5 rounded">src/App.omni</code> to get started.
  </Text>

  <Stack class="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl mt-4">
    <Text class="text-sm font-semibold uppercase tracking-wider text-zinc-500">Counter State</Text>
    <Text class="text-5xl font-bold text-zinc-900 dark:text-white" bind-text="?count">0</Text>
    
    <Stack class="flex flex-row gap-2 mt-2">
      <Action class="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" on-click="decrement">- Decrement</Action>
      <Action class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors" on-click="increment">+ Increment</Action>
    </Stack>
  </Stack>
</Stack>`;
    fs.writeFileSync(path.join(projectDir, 'src', 'App.omni'), appOmni, 'utf8');

    // src/input.css
    const inputCss = `@import "tailwindcss";\n@source "./**/*.omni";`;
    fs.writeFileSync(path.join(projectDir, 'src', 'input.css'), inputCss, 'utf8');

    console.log(`\n🎉 Project "${projectName}" created successfully!`);
    console.log(`To get started running the project:\n  cd ${projectName}\n  npm install\n  npm run dev`);
  } catch (e) {
    console.error('Project creation failed:', e);
    process.exit(1);
  }
} else {
  console.log('Usage:\n  omni build <entry> [--outdir=dist]\n  omni create <project-name>');
}
