import { useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import "./style.css"
import { loadMaster, saveMaster } from "./lib/db"
import { activeSkills, compileSource, createSelection, parseResume } from "./lib/parser"
import { compilePdf } from "./lib/pdf"
import { extractSkills, scoreSkills } from "./lib/skills"
import { SAMPLE_TEX } from "./lib/sample"
import type { JobContext, Selection } from "./lib/types"

export default function SidePanel() {
  const [activeTab, setActiveTab] = useState<"tailor" | "editor">("tailor")
  const [tex, setTex] = useState("")
  const [selection, setSelection] = useState<Selection>({})
  const [job, setJob] = useState<JobContext>({ text: "", skills: [], companyName: "", pageTitle: "" })
  const [manualSkill, setManualSkill] = useState("")
  const [isCompiling, setIsCompiling] = useState(false)
  const [status, setStatus] = useState({ text: "Scan a job description or select resume blocks to get started.", type: "info" })
  const [lastPdfUrl, setLastPdfUrl] = useState<string | null>(null)
  const [lastFilename, setLastFilename] = useState<string>("")

  const tree = useMemo(() => parseResume(tex), [tex])
  const activeResumeSkills = useMemo(() => activeSkills(tree, selection), [tree, selection])
  const score = useMemo(() => scoreSkills(job.skills, activeResumeSkills), [job.skills, activeResumeSkills])

  // Skill categorization
  const canonicalSet = useMemo(() => new Set(activeResumeSkills.map(s => s.toLowerCase().replace(/[^a-z0-9+#.]/g, ""))), [activeResumeSkills])
  const matchedSkills = useMemo(() => job.skills.filter(s => canonicalSet.has(s.toLowerCase().replace(/[^a-z0-9+#.]/g, ""))), [job.skills, canonicalSet])
  const missingSkills = useMemo(() => job.skills.filter(s => !canonicalSet.has(s.toLowerCase().replace(/[^a-z0-9+#.]/g, ""))), [job.skills, canonicalSet])

  useEffect(() => {
    loadMaster().then(saved => {
      const source = saved || SAMPLE_TEX
      setTex(source)
      setSelection(createSelection(parseResume(source)))
    })
  }, [])

  const updateTex = (value: string) => {
    setTex(value)
    const newTree = parseResume(value)
    setSelection(current => {
      // Keep existing selection states for unchanged IDs, auto-select new ones
      const newSel = createSelection(newTree)
      const merged: Selection = {}
      Object.keys(newSel).forEach(id => {
        merged[id] = current[id] !== undefined ? current[id] : true
      })
      return merged
    })
    saveMaster(value)
  }

  const loadTemplate = () => {
    if (confirm("Reset to default Ruthwik Master LaTeX template? Any custom edits to master.tex will be overwritten.")) {
      updateTex(SAMPLE_TEX)
      setStatus({ text: "Restored Ruthwik Master LaTeX template.", type: "success" })
    }
  }

  const toggle = (id: string, checked: boolean) => setSelection(current => ({ ...current, [id]: checked }))

  const toggleSection = (sectionName: string, enable: boolean) => {
    const section = tree.sections.find(s => s.name === sectionName)
    if (!section) return
    setSelection(current => {
      const next = { ...current }
      section.blocks.forEach(b => {
        next[b.id] = enable
        b.bullets.forEach(bullet => {
          next[bullet.id] = enable
        })
      })
      return next
    })
  }

  const scan = async () => {
    setStatus({ text: "Scanning active page locally...", type: "info" })
    try {
      const response = await chrome.runtime.sendMessage({ type: "CRESUME_READ_JOB" })
      if (response && response.text) {
        setJob({
          text: response.text,
          skills: response.skills || [],
          companyName: response.companyName || "Company",
          pageTitle: response.title || ""
        })
        setStatus({
          text: `Found ${response.skills?.length || 0} job skills for ${response.companyName || "Company"}.`,
          type: "success"
        })
      } else {
        setStatus({
          text: "Could not scrape JD automatically. Paste text below or add skills manually.",
          type: "warning"
        })
      }
    } catch {
      setStatus({ text: "Extension permission missing or invalid tab. Try refreshing active tab.", type: "error" })
    }
  }

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = manualSkill.trim()
    if (trimmed && !job.skills.includes(trimmed)) {
      setJob(j => ({ ...j, skills: [...j.skills, trimmed] }))
      setManualSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setJob(j => ({ ...j, skills: j.skills.filter(s => s !== skill) }))
  }

  const exportAndApply = async () => {
    if (!tree.sections.length) {
      return setStatus({ text: "No tagged LaTeX sections found. Use % <section> tags in Master LaTeX.", type: "error" })
    }

    const company = safeName(job.companyName || "Company")
    const filename = `Ruthwik-resume-${company}.pdf`
    setLastFilename(filename)
    setIsCompiling(true)
    setStatus({ text: "Compiling LaTeX with WebAssembly...", type: "info" })

    const compiledTex = compileSource(tex, selection)

    let blob: Blob
    try {
      blob = await compilePdf(compiledTex)
    } catch (error) {
      setIsCompiling(false)
      const msg = error instanceof Error ? error.message : "Compilation failed."
      setStatus({ text: `LaTeX compilation failed: ${msg}`, type: "error" })
      return
    }

    setIsCompiling(false)
    const url = URL.createObjectURL(blob)
    setLastPdfUrl(url)

    // Download file locally via Chrome Downloads API
    try {
      await chrome.downloads.download({ url, filename, saveAs: false })
    } catch (e) {
      console.warn("Chrome download failed:", e)
    }

    // Try DOM injection into active tab
    const dataUrl = await blobToDataUrl(blob)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    let injection = { ok: false, reason: "No active tab found." }
    if (tab?.id) {
      injection = await chrome.tabs.sendMessage(tab.id, { type: "CRESUME_INJECT_PDF", dataUrl, filename })
        .catch(() => ({ ok: false, reason: "Page doesn't have an accessible file upload form." }))
    }

    setStatus({
      text: `${filename} compiled & downloaded! ${injection.ok ? "Attached to application form." : injection.reason}`,
      type: injection.ok ? "success" : "warning"
    })
  }

  return (
    <main className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-cyan-400">
              ResuMatch · Personal Edition
            </span>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Ruthwik's Resume Tailor</h1>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("tailor")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "tailor" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🎯 Tailor
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "editor" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📝 Master TeX
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Match Score Card */}
        <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Live Match Score</h2>
              <p className="text-xs text-slate-500">
                {job.companyName ? `Targeting: ${job.companyName}` : "Scan job page to calculate"}
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-black ${
                score >= 80 ? "text-emerald-400" : score >= 50 ? "text-cyan-400" : "text-amber-400"
              }`}>
                {score}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                score >= 80 ? "bg-gradient-to-r from-cyan-400 to-emerald-400" : score >= 50 ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-amber-400"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>

          {/* Action Row */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={scan}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 px-3 text-xs font-semibold text-cyan-300 transition"
            >
              🔍 Scan Active Job Page
            </button>
          </div>

          {/* Skills Breakdown */}
          {job.skills.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                <span>Job Keywords ({matchedSkills.length}/{job.skills.length} matched)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {matchedSkills.map(skill => (
                  <span
                    key={skill}
                    onClick={() => removeSkill(skill)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 cursor-pointer hover:bg-rose-950 hover:border-rose-700 hover:text-rose-300 transition"
                    title="Click to remove skill"
                  >
                    ✓ {skill}
                  </span>
                ))}
                {missingSkills.map(skill => (
                  <span
                    key={skill}
                    onClick={() => removeSkill(skill)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 border border-slate-700 text-slate-400 cursor-pointer hover:bg-rose-950 hover:border-rose-700 hover:text-rose-300 transition"
                    title="Click to remove skill"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
              <form onSubmit={addCustomSkill} className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add target skill manually..."
                  value={manualSkill}
                  onChange={e => setManualSkill(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button type="submit" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded text-slate-200">
                  Add
                </button>
              </form>
            </div>
          )}
        </section>

        {activeTab === "tailor" ? (
          /* TAILOR TAB */
          <div className="space-y-4">
            {/* Resume Blocks Picker */}
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Resume Content Selection ({Object.values(selection).filter(Boolean).length} items active)
                </h2>
              </div>

              {tree.sections.length === 0 ? (
                <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-center text-xs text-amber-300">
                  No tagged sections found in LaTeX source. Switch to <strong>Master TeX</strong> tab to view or add <code>% &lt;section name="..."&gt;</code> tags.
                </div>
              ) : (
                tree.sections.map(section => (
                  <div key={section.name} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                        {section.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleSection(section.name, true)}
                          className="text-[10px] text-slate-400 hover:text-cyan-300 font-medium"
                        >
                          Select All
                        </button>
                        <span className="text-slate-700">|</span>
                        <button
                          onClick={() => toggleSection(section.name, false)}
                          className="text-[10px] text-slate-400 hover:text-amber-400 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="p-3 space-y-3 divide-y divide-slate-800/50">
                      {section.blocks.map(block => (
                        <div key={block.id} className="pt-2 first:pt-0 space-y-1.5">
                          <label className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={!!selection[block.id]}
                              onChange={e => toggle(block.id, e.target.checked)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/20"
                            />
                            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                              {block.title}
                            </span>
                          </label>

                          {block.bullets.length > 0 && (
                            <div className="ml-6 space-y-2 border-l border-slate-800 pl-3 pt-1">
                              {block.bullets.map(bullet => (
                                <label key={bullet.id} className="flex items-start gap-2 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    disabled={!selection[block.id]}
                                    checked={!!selection[bullet.id]}
                                    onChange={e => toggle(bullet.id, e.target.checked)}
                                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/20 disabled:opacity-30"
                                  />
                                  <div className="text-xs space-y-1">
                                    <p className={`leading-snug ${selection[block.id] && selection[bullet.id] ? "text-slate-300" : "text-slate-500 line-through"}`}>
                                      {bullet.title}
                                    </p>
                                    {bullet.skills.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {bullet.skills.map(s => {
                                          const isMatch = canonicalSet.has(s.toLowerCase().replace(/[^a-z0-9+#.]/g, ""))
                                          return (
                                            <span
                                              key={s}
                                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                                isMatch
                                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold"
                                                  : "bg-slate-950 text-slate-400 border border-slate-800"
                                              }`}
                                            >
                                              {s}
                                            </span>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Status Message */}
            <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
              status.type === "error" ? "bg-rose-950/40 border-rose-800/80 text-rose-200" :
              status.type === "success" ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200" :
              status.type === "warning" ? "bg-amber-950/40 border-amber-800/80 text-amber-200" :
              "bg-slate-900 border-slate-800 text-slate-300"
            }`}>
              {status.text}
            </div>

            {/* Main Action Button */}
            <button
              onClick={exportAndApply}
              disabled={isCompiling}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCompiling ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                  Compiling Wasm TeX & Injecting...
                </>
              ) : (
                <>🚀 Generate & Apply Resume</>
              )}
            </button>

            {lastPdfUrl && (
              <div className="text-center pt-1">
                <a
                  href={lastPdfUrl}
                  download={lastFilename}
                  className="text-xs text-cyan-400 hover:underline font-medium"
                  target="_blank"
                  rel="noreferrer"
                >
                  📥 Download {lastFilename} directly
                </a>
              </div>
            )}
          </div>
        ) : (
          /* MASTER TEX EDITOR TAB */
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400">Master LaTeX Source Code</span>
              <button
                onClick={loadTemplate}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
              >
                Reset to Ruthwik Template
              </button>
            </div>

            <textarea
              value={tex}
              onChange={e => updateTex(e.target.value)}
              className="w-full h-96 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 leading-relaxed resize-y shadow-inner"
              spellCheck={false}
              placeholder="Paste your annotated LaTeX source code here..."
            />

            <div className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-1">
              <p className="font-bold text-slate-300">Tagging System Format:</p>
              <code className="block font-mono text-cyan-300">
                % &lt;section name="Experience"&gt;<br />
                % &lt;block id="oracle" title="Software Engineer — Oracle"&gt;<br />
                % &lt;bullet id="oracle_nudge" skills="Java, SQL"&gt;<br />
                \item ...<br />
                % &lt;/bullet&gt;<br />
                % &lt;/block&gt;<br />
                % &lt;/section&gt;
              </code>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(<SidePanel />)

const safeName = (name: string) => name.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "") || "Company"
const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result as string)
  reader.onerror = reject
  reader.readAsDataURL(blob)
})

