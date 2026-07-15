import { extractSkills } from "./lib/skills"

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "CRESUME_READ_JOB") return
  readActiveJob().then(sendResponse)
  return true
})

async function readActiveJob() {
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  if (!tab?.id) return { text: "", title: "", companyName: "", skills: [] }
  try {
    const page = await chrome.tabs.sendMessage(tab.id, { type: "CRESUME_READ_JOB" })
    const text = page?.text || ""
    const title = page?.title || tab.title || ""
    return { text, title, companyName: page?.companyName || guessCompany(title), skills: extractSkills(text) }
  } catch { return { text: "", title: tab.title || "", companyName: guessCompany(tab.title || ""), skills: [] } }
}

function guessCompany(value: string) { return value.replace(/\s*(?:[-|–]\s*)?(?:careers?|jobs?|job application).*$/i, "").split(/[-|–]/)[0].trim() || "Company" }
