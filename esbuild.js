const esbuild = require('esbuild');
const watch = process.argv.includes('--watch');

const ctx = esbuild.context({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  minify: false,
});

ctx.then(c => {
  if (watch) {
    c.watch();
    console.log('Watching...');
  } else {
    c.rebuild().then(() => {
      c.dispose();
      console.log('Built.');
    });
  }
});