// Siglum only uses BLAKE3 to key its local compilation cache. Its published
// browser build currently references a missing generated glue file, so use a
// deterministic, non-cryptographic cache key instead. This never hashes resume
// data for transport or security purposes.
export function hash(input: string | Uint8Array, options: { length?: number } = {}) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input
  let value = 2166136261
  for (const byte of bytes) { value ^= byte; value = Math.imul(value, 16777619) }
  const length = options.length || 8
  const output = new Uint8Array(length)
  for (let i = 0; i < length; i++) output[i] = (value >>> ((i % 4) * 8)) & 0xff
  return { toString: (_encoding?: string) => Array.from(output).map(b => b.toString(16).padStart(2, "0")).join("") }
}
