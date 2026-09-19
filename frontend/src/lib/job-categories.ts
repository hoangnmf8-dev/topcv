export const JOB_CATEGORIES = [
  { code: "sales", name: "Kinh doanh / Bán hàng", specialties: ["Chuyên viên Kinh doanh", "Nhân viên Phát triển Khách hàng", "Account Executive"] },
  { code: "marketing", name: "Marketing / Truyền thông", specialties: ["Chuyên viên Digital Marketing", "Content Marketing Executive", "Social Media Executive"] },
  { code: "customer-service", name: "Chăm sóc khách hàng", specialties: ["Chuyên viên Chăm sóc Khách hàng", "Customer Success Executive", "Nhân viên Tổng đài"] },
  { code: "hr-admin", name: "Nhân sự / Hành chính", specialties: ["Chuyên viên Tuyển dụng", "Chuyên viên C&B", "Nhân viên Hành chính Nhân sự"] },
  { code: "it", name: "Công nghệ thông tin", specialties: ["Lập trình viên Frontend", "Lập trình viên Backend", "Kỹ sư Kiểm thử phần mềm"] },
  { code: "finance-banking", name: "Tài chính / Ngân hàng", specialties: ["Chuyên viên Quan hệ Khách hàng", "Chuyên viên Tư vấn Tài chính", "Chuyên viên Phân tích Tín dụng"] },
  { code: "real-estate", name: "Bất động sản", specialties: ["Chuyên viên Kinh doanh Bất động sản", "Chuyên viên Tư vấn Đầu tư", "Chuyên viên Phát triển Dự án"] },
  { code: "accounting-audit", name: "Kế toán / Kiểm toán", specialties: ["Kế toán Tổng hợp", "Kế toán Thuế", "Chuyên viên Kiểm toán Nội bộ"] },
] as const

export const JOB_CATEGORY_NAMES = JOB_CATEGORIES.map((category) => category.name)
export const JOB_CATEGORY_BY_CODE = Object.fromEntries(JOB_CATEGORIES.map((category) => [category.code, category.name]))
export const JOB_CATEGORY_SPECIALTIES = Object.fromEntries(JOB_CATEGORIES.map((category) => [category.name, [...category.specialties]]))
