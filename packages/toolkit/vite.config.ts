import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import packageJSON from './package.json' assert { type: 'json' };

/**
 * Packages to be excluded from the bundle.
 */
const dependenciesKeys: string[] = [
  ...Object.keys(packageJSON['dependencies'] ?? {}),
  ...Object.keys(packageJSON['peerDependencies'] ?? {}),
];

export default defineConfig({
  build: {
    target: 'modules',
    sourcemap: true,
    lib: {
      entry: {
        reduxToolkit: resolve(__dirname, 'src/index.ts'),
        reduxToolkitNanoid: resolve(__dirname, 'src/nanoid/index.ts'),
        reduxToolkitReact: resolve(__dirname, 'src/react/index.ts'),
        reduxToolkitQuery: resolve(__dirname, 'src/query/index.ts'),
        reduxToolkitQueryReact: resolve(__dirname, 'src/query/react/index.ts'),
        reduxToolkitInternal: resolve(__dirname, 'src/internal/index.ts'),

        // Re-exports
        immer: resolve(__dirname, 'src/immer/index.ts'),
        redux: resolve(__dirname, 'src/redux/index.ts'),
        reduxThunk: resolve(__dirname, 'src/redux-thunk/index.ts'),
        reselect: resolve(__dirname, 'src/reselect/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
        /**
         * Explicitly define globals as their package name for the UMD build.
         */
        globals: dependenciesKeys.reduce((acc, key) => {
          acc[key] = key;
          return acc;
        }, {}),
      },
      external: [
        /^@reduxjs\/toolkit(\/?.*)/,
        ...dependenciesKeys,
      ]
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    include: ['./src/**/*.(spec|test).[jt]s?(x)'],
    alias: [
      {
        find: /^@reduxjs\/toolkit(\/?.*)/,
        replacement: resolve("src$1/index.ts"),
      },
      {
        find: /^@internal(\/?.*)/,
        replacement: resolve("src$1"),
      },
    ],
    deps: {
      interopDefault: true,
      inline: ['redux', '@reduxjs/toolkit'],
    },
  },
});
