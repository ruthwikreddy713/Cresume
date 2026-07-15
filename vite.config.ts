import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"

const fromRoot = (file: string) => new URL(file, import.meta.url).pathname

export default defineConfig({
  plugins: [react(), wasm()],
  resolve: { alias: { "blake3-wasm/browser.js": fromRoot("./lib/blake3-shim.ts") } },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: { sidepanel: fromRoot("./sidepanel.html"), background: fromRoot("./background.ts"), content: fromRoot("./contents/job-page.ts") },
      output: { entryFileNames: "[name].js", chunkFileNames: "assets/[name]-[hash].js", assetFileNames: "assets/[name]-[hash][extname]" }
    }
  }
})
