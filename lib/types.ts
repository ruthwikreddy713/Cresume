export type ResumeBullet = { id: string; skills: string[]; tex: string; title: string }
export type ResumeBlock = { id: string; title: string; tex: string; bullets: ResumeBullet[] }
export type ResumeSection = { name: string; blocks: ResumeBlock[] }
export type ResumeTree = { sections: ResumeSection[] }

export type Selection = Record<string, boolean>
export type JobContext = { text: string; skills: string[]; companyName: string; pageTitle: string }
