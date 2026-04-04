import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'node',
  format: ['cjs'],
  outDir: 'dist',
  splitting: false,
  noExternal: ['@repo/api', '@repo/auth', '@repo/cache', '@repo/db', '@repo/validation'],
})
