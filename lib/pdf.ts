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

/** Fast in-memory PDF page count calculator */
export async function getPdfPageCount(pdfBlob: Blob): Promise<number> {
  try {
    const buffer = await pdfBlob.arrayBuffer()
    const text = new TextDecoder("latin1").decode(new Uint8Array(buffer))

    // Match /Count N in root /Pages tree
    const rootPagesMatch = text.match(/\/Type\s*\/Pages[\s\S]*?\/Count\s+(\d+)/)
    if (rootPagesMatch && rootPagesMatch[1]) {
      const count = parseInt(rootPagesMatch[1], 10)
      if (!isNaN(count) && count > 0) return count
    }

    // Fallback: count individual /Type /Page objects
    const pageMatches = text.match(/\/Type\s*\/Page\b/g)
    if (pageMatches && pageMatches.length > 0) {
      return pageMatches.length
    }
  } catch (e) {
    console.warn("Could not determine PDF page count:", e)
  }
  return 1
}

