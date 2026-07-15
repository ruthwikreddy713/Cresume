// Kept deliberately transparent: users can extend this vocabulary without sending their JD anywhere.
export const SKILL_VOCABULARY = [
  "Java", "JavaScript", "TypeScript", "Python", "C++", "React", "Next.js", "Node.js",
  "Spring Boot", "Spring", "Kafka", "Redis", "PostgreSQL", "MySQL", "MongoDB",
  "Microservices", "AWS", "Docker", "Kubernetes", "Terraform", "Linux", "Git",
  "REST", "GraphQL", "CI/CD", "Machine Learning", "SQL", "Angular", "Go", "Rust",
  "OracleSQL", "Oracle", "KnockoutJS", "FFmpeg", "gRPC", "Protocol Buffers",
  "Distributed Systems", "Concurrency", "Multi-threading", "Systems Programming",
  "Bloom Filters", "WAL", "RESP", "EC2", "S3", "ADF", "Redwood"
]

const canonical = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]/g, "")

export function extractSkills(text: string): string[] {
  if (!text) return []
  const lower = text.toLowerCase()
  const found = new Set<string>()

  for (const skill of SKILL_VOCABULARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(?:^|[^a-z0-9+#.])${escaped}(?:$|[^a-z0-9+#.])`, "i")
    if (regex.test(lower)) {
      found.add(skill)
    }
  }
  return Array.from(found)
}

export function scoreSkills(jdSkills: string[], resumeSkills: string[]) {
  if (!jdSkills || !jdSkills.length) return 0
  const active = new Set(resumeSkills.map(canonical))
  const matched = jdSkills.filter((skill) => active.has(canonical(skill)))
  return Math.round((matched.length / jdSkills.length) * 100)
}

