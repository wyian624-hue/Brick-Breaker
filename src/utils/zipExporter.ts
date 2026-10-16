/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

export interface ProjectFile {
  path: string;
  content: string;
}

export async function exportProjectZip(additionalFiles: ProjectFile[] = []) {
  const zip = new JSZip();

  // Root files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'neon-breakout',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'tsc --noEmit',
        },
        dependencies: {
          'canvas-confetti': '^1.9.4',
          'lucide-react': '^0.546.0',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          jszip: '^3.10.2',
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.3.3',
          '@types/canvas-confetti': '^1.9.0',
          '@types/jszip': '^3.4.1',
          '@types/node': '^22.14.0',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
          '@vitejs/plugin-react': '^6.1.1',
          tailwindcss: '^4.3.3',
          typescript: '^7.0.2',
          vite: '^8.3.0',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: true,
          paths: {
            '@/*': ['./src/*'],
          },
        },
        include: ['src'],
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`
  );

  zip.file(
    '.gitignore',
    `node_modules/
dist/
.DS_Store
*.log
.env*
!.env.example
`
  );

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Neon Breakout - 經典打磚塊遊戲</title>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  // Add all dynamically passed project files
  for (const file of additionalFiles) {
    zip.file(file.path, file.content);
  }

  // Generate blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'neon-breakout-master.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
