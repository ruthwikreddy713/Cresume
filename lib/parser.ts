import type { ResumeBlock, ResumeBullet, ResumeTree, Selection } from "./types"
import { extractSkills } from "./skills"

const sectionRe = /%\s*<section\s+name=["']([^"']+)["']\s*>\s*([\s\S]*?)%\s*<\/section\s*>/g
const blockRe = /%\s*<block\s+id=["']([^"']+)["']\s+title=["']([^"']+)["']\s*>\s*([\s\S]*?)%\s*<\/block\s*>/g
const bulletRe = /%\s*<bullet\s+id=["']([^"']+)["'](?:\s+skills=["']([^"']*)["'])?\s*>\s*([\s\S]*?)%\s*<\/bullet\s*>/g

export function parseResume(tex: string): ResumeTree {
  const sections: ResumeTree["sections"] = []
  for (const section of tex.matchAll(sectionRe)) {
    const blocks: ResumeBlock[] = []
    for (const block of section[2].matchAll(blockRe)) {
      const bullets: ResumeBullet[] = []
      for (const bullet of block[3].matchAll(bulletRe)) {
        bullets.push({
          id: bullet[1],
          title: plainText(bullet[3]),
          skills: bullet[2] ? bullet[2].split(",").map(s => s.trim()).filter(Boolean) : extractSkills(bullet[3]),
          tex: bullet[3]
        })
      }
      blocks.push({ id: block[1], title: block[2], tex: block[3], bullets })
    }
    sections.push({ name: section[1], blocks })
  }
  return { sections }
}

export function createSelection(tree: ResumeTree): Selection {
  const selected: Selection = {}
  tree.sections.forEach(s => s.blocks.forEach(b => {
    selected[b.id] = true
    b.bullets.forEach(x => selected[x.id] = true)
  }))
  return selected
}

export function activeSkills(tree: ResumeTree, selection: Selection): string[] {
  const skills = tree.sections.flatMap(s =>
    s.blocks.flatMap(b =>
      selection[b.id] ? b.bullets.filter(x => selection[x.id]).flatMap(x => x.skills) : []
    )
  )
  return Array.from(new Set(skills))
}

// Removing wrapper comments preserves the original LaTeX around the annotated content.
export function compileSource(tex: string, selection: Selection): string {
  let compiled = tex.replace(blockRe, (_all, id, _title, body) => {
    if (!selection[id]) return ""
    return body.replace(bulletRe, (_bullet: string, bulletId: string, _skills: string, content: string) =>
      selection[bulletId] ? content : ""
    )
  }).replace(sectionRe, (_all, _name, body) => body)

  // Remove empty itemize environments left behind when all bullets are deselected
  compiled = compiled.replace(/\\begin\{itemize\}(?:\[[^\]]*\])?\s*\\end\{itemize\}/g, "")

  return compiled
}

function plainText(value: string) {
  return value
    .replace(/%.*$/gm, "")
    .replace(/\\item\s*/g, "")
    .replace(/\\[a-zA-Z]+(?:\[[^\]]*\])?(?:\{([^}]*)\})?/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
}

