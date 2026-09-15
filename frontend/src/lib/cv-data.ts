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

export const DEFAULT_CV: CVData = {
  personal: {
    avatar: "",
    fullName: "Nguyễn Văn A",
    title: "Front-end Developer",
    phone: "0912 345 678",
    email: "nguyenvana@gmail.com",
    address: "Quận 1, TP. Hồ Chí Minh",
    github: "github.com/nguyenvana",
    linkedin: "linkedin.com/in/nguyenvana",
  },
  objective:
    "Lập trình viên Front-end với hơn 3 năm kinh nghiệm xây dựng giao diện web hiện đại bằng React và Next.js. Đam mê tạo ra trải nghiệm người dùng mượt mà, tối ưu hiệu suất và có khả năng làm việc nhóm hiệu quả.",
  experiences: [
    {
      id: "exp-1",
      company: "Công ty TNHH Công nghệ FPT",
      role: "Front-end Developer",
      timeline: "01/2022 - Hiện tại",
      bullets: [
        "Phát triển và bảo trì giao diện cho hệ thống quản lý nội bộ phục vụ hơn 2.000 người dùng.",
        "Tối ưu thời gian tải trang giảm 40% bằng kỹ thuật code-splitting và lazy loading.",
        "Phối hợp với đội thiết kế để xây dựng hệ thống design system dùng chung.",
      ],
    },
    {
      id: "exp-2",
      company: "Startup EdTech VietLearn",
      role: "Junior Web Developer",
      timeline: "06/2020 - 12/2021",
      bullets: [
        "Xây dựng landing page và trang khóa học bằng Next.js, tăng tỷ lệ chuyển đổi 25%.",
        "Tích hợp API thanh toán và hệ thống xác thực người dùng.",
      ],
    },
  ],
  educations: [
    {
      id: "edu-1",
      school: "Đại học Bách Khoa TP.HCM",
      degree: "Kỹ sư Công nghệ Thông tin",
      timeline: "2016 - 2020",
    },
  ],
  skills: [
    { id: "sk-1", name: "React / Next.js", level: 5 },
    { id: "sk-2", name: "TypeScript", level: 4 },
    { id: "sk-3", name: "Tailwind CSS", level: 5 },
    { id: "sk-4", name: "Node.js", level: 3 },
    { id: "sk-5", name: "Figma", level: 4 },
  ],
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
