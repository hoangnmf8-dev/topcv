export type TemplateId = "modern" | "classic" | "minimal" | "executive" | "tech" | "creative" | "sales" | "graduate" | "ats"
export type ThemeId = "emerald" | "navy" | "purple" | "slate"

export interface ExperienceItem {
  id: string
  company: string
  role: string
  timeline: string
  bullets: string[]
}

export interface EducationItem {
  id: string
  school: string
  degree: string
  timeline: string
}

export interface SkillItem {
  id: string
  name: string
  level: number // 1 - 5
}

export interface CVData {
  personal: {
    avatar: string
    fullName: string
    title: string
    phone: string
    email: string
    address: string
    github: string
    linkedin: string
  }
  objective: string
  experiences: ExperienceItem[]
  educations: EducationItem[]
  skills: SkillItem[]
}

export const TEMPLATES: { id: TemplateId; label: string; description: string }[] = [
  { id: "modern", label: "Hiện đại", description: "Bố cục 2 cột, sidebar màu" },
  { id: "classic", label: "Thanh lịch", description: "Trang trọng, chữ serif" },
  { id: "minimal", label: "Tối giản", description: "Nhiều khoảng trắng, dễ đọc" },
  { id: "executive", label: "Quản lý cấp cao", description: "Nhấn mạnh thành tích lãnh đạo" },
  { id: "tech", label: "Công nghệ", description: "Rõ kỹ năng và dự án kỹ thuật" },
  { id: "creative", label: "Sáng tạo", description: "Dấu ấn màu sắc nổi bật" },
  { id: "sales", label: "Kinh doanh", description: "Tập trung KPI và kết quả" },
  { id: "graduate", label: "Sinh viên", description: "Ưu tiên học vấn và tiềm năng" },
  { id: "ats", label: "ATS chuẩn", description: "Một cột, dễ đọc bởi hệ thống" },
]

export const THEMES: {
  id: ThemeId
  label: string
  accent: string
  soft: string
  ink: string
}[] = [
  { id: "emerald", label: "Emerald", accent: "#00b14f", soft: "#e7f7ee", ink: "#0a5c30" },
  { id: "navy", label: "Navy", accent: "#1e40af", soft: "#e6ecfb", ink: "#152a63" },
  { id: "purple", label: "Purple", accent: "#7c3aed", soft: "#f0e9fd", ink: "#4c1d95" },
  { id: "slate", label: "Dark Slate", accent: "#334155", soft: "#e9edf2", ink: "#1e293b" },
]

export function getTheme(id: ThemeId) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export const EMPTY_CV: CVData = { personal: { avatar: "", fullName: "", title: "", phone: "", email: "", address: "", github: "", linkedin: "" }, objective: "", experiences: [], educations: [], skills: [] };
export function uid(prefix = "id") { return prefix + "-" + crypto.randomUUID(); }
