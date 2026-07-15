import Dexie, { type Table } from "dexie"

type ResumeRecord = { id: "master"; tex: string; updatedAt: number }
class CResumeDB extends Dexie {
  resumes!: Table<ResumeRecord, string>
  constructor() { super("cresume"); this.version(1).stores({ resumes: "id, updatedAt" }) }
}
export const db = new CResumeDB()
export const loadMaster = async () => (await db.resumes.get("master"))?.tex ?? ""
export const saveMaster = async (tex: string) => db.resumes.put({ id: "master", tex, updatedAt: Date.now() })
