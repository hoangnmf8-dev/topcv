export type AITask = "summary" | "improve" | "optimize"

export async function callAI(
  task: AITask,
  payload: { context?: string; text?: string },
): Promise<string> {
  await new Promise((resolve) => window.setTimeout(resolve, 700))
  if (task === "improve") {
    const lines = (payload.text ?? "Phối hợp phát triển sản phẩm và hoàn thành công việc đúng tiến độ.")
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean)
    return lines.map((line) => `- Chủ động ${line.charAt(0).toLowerCase()}${line.slice(1)}`).join("\n")
  }
  return "Với nền tảng chuyên môn vững chắc và tinh thần học hỏi chủ động, mong muốn phát triển lâu dài trong môi trường chuyên nghiệp. Luôn tập trung tạo ra kết quả thiết thực, phối hợp hiệu quả cùng đội ngũ và không ngừng nâng cao năng lực để đóng góp bền vững cho doanh nghiệp."
}

export function buildContext(data: {
  personal: { fullName: string; title: string }
  experiences: { company: string; role: string }[]
  skills: { name: string }[]
}): string {
  const exp = data.experiences
    .map((e) => `${e.role} tại ${e.company}`)
    .join("; ")
  const skills = data.skills.map((s) => s.name).join(", ")
  return `Họ tên: ${data.personal.fullName}. Vị trí ứng tuyển: ${data.personal.title}. Kinh nghiệm: ${exp}. Kỹ năng: ${skills}.`
}
