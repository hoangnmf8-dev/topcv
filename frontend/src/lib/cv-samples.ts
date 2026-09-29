import type { CVData, TemplateId } from "./cv-layout";
const profiles: Record<
  TemplateId,
  { title: string; skills: string[]; work: string[] }
> = {
  modern: {
    title: "Lập trình viên Frontend",
    skills: ["React & TypeScript", "HTML / CSS", "Git", "REST API"],
    work: [
      "Phát triển giao diện quản lý đơn hàng với React và TypeScript.",
      "Phối hợp cùng thiết kế để tối ưu trải nghiệm trên điện thoại.",
    ],
  },
  classic: {
    title: "Chuyên viên Kinh doanh",
    skills: ["Tư vấn khách hàng", "Đàm phán", "Excel", "Quản lý CRM"],
    work: [
      "Tư vấn giải pháp phù hợp nhu cầu của nhóm khách hàng doanh nghiệp.",
      "Theo dõi cơ hội kinh doanh và phối hợp chăm sóc sau bán hàng.",
    ],
  },
  minimal: {
    title: "Chuyên viên Nhân sự",
    skills: ["Tuyển dụng", "Giao tiếp", "Excel", "Quản lý hồ sơ"],
    work: [
      "Theo dõi kế hoạch tuyển dụng và phối hợp tổ chức phỏng vấn.",
      "Chuẩn hóa hồ sơ nhân sự và hỗ trợ chương trình hội nhập.",
    ],
  },
  executive: {
    title: "Trưởng phòng Vận hành",
    skills: [
      "Quản lý đội nhóm",
      "Lập kế hoạch",
      "Phân tích dữ liệu",
      "Quản lý ngân sách",
    ],
    work: [
      "Điều phối đội ngũ 12 thành viên, theo dõi tiến độ và chất lượng dịch vụ.",
      "Thiết lập báo cáo vận hành hằng tuần và cải tiến quy trình bàn giao.",
    ],
  },
  tech: {
    title: "Kỹ sư Phần mềm",
    skills: [
      "TypeScript / Node.js",
      "PostgreSQL",
      "Docker",
      "Kiểm thử tự động",
    ],
    work: [
      "Xây dựng API cho hệ thống quản lý sản phẩm và phân quyền người dùng.",
      "Bổ sung kiểm thử tự động và theo dõi lỗi trong quá trình triển khai.",
    ],
  },
  creative: {
    title: "Chuyên viên Thiết kế",
    skills: ["Figma", "Illustrator", "Photoshop", "Thiết kế thương hiệu"],
    work: [
      "Thiết kế bộ nhận diện và ấn phẩm cho chiến dịch truyền thông.",
      "Xây dựng thư viện thành phần để giữ tính nhất quán giữa các thiết kế.",
    ],
  },
  sales: {
    title: "Chuyên viên Phát triển Kinh doanh",
    skills: [
      "Tìm kiếm khách hàng",
      "Thuyết trình",
      "CRM",
      "Chăm sóc khách hàng",
    ],
    work: [
      "Quản lý danh sách khách hàng tiềm năng và lịch hẹn tư vấn.",
      "Phối hợp với bộ phận sản phẩm xây dựng đề xuất và báo giá.",
    ],
  },
  graduate: {
    title: "Thực tập sinh Marketing",
    skills: ["Viết nội dung", "Canva", "Excel", "Làm việc nhóm"],
    work: [
      "Xây dựng lịch nội dung cho kênh truyền thông của câu lạc bộ.",
      "Hỗ trợ khảo sát và tổng hợp phản hồi sau sự kiện sinh viên.",
    ],
  },
  ats: {
    title: "Chuyên viên Phân tích Dữ liệu",
    skills: ["SQL", "Python", "Power BI", "Phân tích dữ liệu"],
    work: [
      "Tổng hợp dữ liệu bán hàng và xây dựng báo cáo theo tháng.",
      "Kiểm tra chất lượng dữ liệu và trao đổi yêu cầu với các bộ phận.",
    ],
  },
};
export function getCVSample(template: TemplateId): CVData {
  const p = profiles[template];
  return {
    personal: {
      avatar: "",
      fullName: "NGUYỄN MINH ANH",
      title: p.title,
      phone: "0900 123 456",
      email: "minhanh@example.com",
      address: "Hà Nội, Việt Nam",
      github: "",
      linkedin: "",
    },
    objective:
      "Mong muốn phát triển ở vị trí " +
      p.title.toLowerCase() +
      ", vận dụng kiến thức chuyên môn để giải quyết các vấn đề thực tế. Chủ động học hỏi, phối hợp cùng đồng nghiệp và theo đuổi chất lượng trong từng công việc.",
    experiences: [
      {
        id: "sample-exp-1",
        company:
          template === "graduate"
            ? "Câu lạc bộ Truyền thông"
            : "Công ty Minh An (mẫu)",
        role: p.title,
        timeline: template === "graduate" ? "2024 – 2025" : "2023 – Hiện tại",
        bullets: p.work,
      },
      {
        id: "sample-exp-2",
        company: "Dự án thực hành",
        role: "Thành viên dự án",
        timeline: "2022 – 2023",
        bullets: [
          "Thu thập yêu cầu, phân chia nhiệm vụ và báo cáo tiến độ hằng tuần.",
          "Hoàn thiện tài liệu bàn giao và trình bày kết quả với nhóm.",
        ],
      },
    ],
    educations: [
      {
        id: "sample-edu",
        school: "Trường Đại học Minh An (mẫu)",
        degree:
          template === "tech" || template === "modern"
            ? "Cử nhân Công nghệ thông tin"
            : "Cử nhân chuyên ngành liên quan",
        timeline: "2019 – 2023",
      },
    ],
    skills: p.skills.map((name, i) => ({
      id: "sample-skill-" + i,
      name,
      level: i === 0 ? 5 : 4,
    })),
  };
}
