import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

export default defineConfig([
  // CommonJS build (for Node.js)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      })
    ],
    external: ['axios']
  },
  // ES module build (for modern bundlers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        rootDir: 'src',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      })
    ],
    external: ['axios']
  },
  // UMD build (for browsers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'AstraSecurity',
      sourcemap: true,
      exports: 'named',
      globals: {
        axios: 'axios'
      }
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        rootDir: 'src',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      }),
      terser()
    ],
    external: ['axios']
  },
  // Minified UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'AstraSecurity',
      sourcemap: true,
      exports: 'named',
      globals: {
        axios: 'axios'
      }
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        rootDir: 'src',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      }),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ],
    external: ['axios']
  }
]);