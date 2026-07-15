import { SiglumCompiler } from "@siglum/engine"
import siglumWorkerUrl from "./siglum-worker.js?url"
import { ENUMITEM_STY } from "./enumitem"

let compiler: SiglumCompiler | undefined

/** Compiles with the bundled WebAssembly engine. There is intentionally no text-PDF fallback. */
export async function compilePdf(source: string): Promise<Blob> {
  const isExtension = typeof chrome !== "undefined" && chrome.runtime?.getURL
  const wasmUrl = isExtension ? chrome.runtime.getURL("busytex.wasm") : "/busytex.wasm"
  const jsUrl = isExtension ? chrome.runtime.getURL("busytex.js") : "/busytex.js"
  const cleanWorkerPath = siglumWorkerUrl.replace(/^\.?\//, "")
  const workerUrl = isExtension ? chrome.runtime.getURL(cleanWorkerPath) : siglumWorkerUrl

  compiler ??= new SiglumCompiler({
    bundlesUrl: "https://cdn.siglum.org/tl2025/bundles",
    wasmUrl,
    jsUrl,
    workerUrl,
    eagerBundles: ["cm-super"],
    verbose: true,
    onLog: (msg) => console.log("[SiglumTeX]", msg)
  })
  await compiler.init()
  const result = await compiler.compile(source, {
    additionalFiles: {
      "enumitem.sty": ENUMITEM_STY
    }
  })
  if (!result.success || !result.pdf) {
    console.error("Siglum LaTeX Compile Full Result:", result)
    let errorMsg = ""
    if (typeof result.error === "string" && result.error) {
      errorMsg = result.error
    } else if (result.error && typeof result.error === "object") {
      errorMsg = (result.error as any).message || JSON.stringify(result.error)
    }
    if (!errorMsg && typeof result.log === "string" && result.log) {
      errorMsg = result.log.slice(-1000)
    }
    if (!errorMsg && result.exitCode !== undefined) {
      errorMsg = `TeX exited with code ${result.exitCode}`
    }
    throw new Error(errorMsg || "LaTeX compilation failed.")
  }
  // Copy into an ArrayBuffer-backed view; the engine may return a SharedArrayBuffer view.
  return new Blob([Uint8Array.from(result.pdf)], { type: "application/pdf" })
}
