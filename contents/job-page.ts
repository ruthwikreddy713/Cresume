chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "CRESUME_READ_JOB") {
    const text = document.body?.innerText?.slice(0, 120000) || ""
    const company = document.querySelector("[class*='company' i], [data-company], .company-name")?.textContent?.trim() || ""
    sendResponse({ text, title: document.title, companyName: company })
  }
  if (message.type === "CRESUME_INJECT_PDF") {
    injectPdf(message.dataUrl, message.filename).then(sendResponse).catch(error => sendResponse({ ok: false, reason: error.message }))
    return true
  }
})

async function injectPdf(dataUrl: string, filename: string) {
  const input = findPdfInput()
  if (!input) return { ok: false, reason: "No visible PDF file input found on this page." }
  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], filename, { type: "application/pdf" })
  const transfer = new DataTransfer()
  transfer.items.add(file)
  input.files = transfer.files
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
  return { ok: true }
}

function findPdfInput() {
  const candidates = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"]'))
  return candidates.find((input) => {
    const accept = (input.accept || "").toLowerCase()
    const label = `${input.name} ${input.id} ${input.getAttribute("aria-label") || ""}`.toLowerCase()
    return !input.disabled && (accept.includes("pdf") || /resume|cv|upload/.test(label) || !accept)
  })
}
