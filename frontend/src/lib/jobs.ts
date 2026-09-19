export type Job = {
  id: string
  title: string
  company: string
  logo: string
  salary: string
  salaryMin: number // triệu VND / tháng, dùng để lọc
  location: string
  district: string
  deadline: string
  experience: string // "0", "1", "2", "3", "5" năm
  jobType: "Full-time" | "Part-time"
  category: string
  tags: string[]
  hot: boolean
  updatedAt: string
  // Chi tiết
  description: string[]
  requirements: string[]
  benefits: string[]
  company_info: {
    size: string
    field: string
    website: string
    address: string
    about: string
  }
}

export { JOB_CATEGORY_NAMES as CATEGORIES } from "@/lib/job-categories"

export const jobs: Job[] = [
  {
    id: "1",
    title: "Senior ReactJS Developer (Remote)",
    company: "FPT Software",
    logo: "/logos/fpt.png",
    salary: "25 - 40 triệu",
    salaryMin: 25,
    location: "Hà Nội",
    district: "Cầu Giấy, Hà Nội",
    deadline: "30/08/2026",
    experience: "3",
    jobType: "Full-time",
    category: "Công nghệ thông tin",
    tags: ["ReactJS", "TypeScript", "NextJS"],
    hot: true,
    updatedAt: "2 giờ trước",
    description: [
      "Phát triển và bảo trì các ứng dụng web quy mô lớn bằng ReactJS và NextJS.",
      "Phối hợp với team Backend, Designer để xây dựng sản phẩm chất lượng cao.",
      "Tối ưu hiệu năng ứng dụng, đảm bảo trải nghiệm người dùng mượt mà.",
      "Tham gia review code, mentor cho các thành viên junior trong team.",
    ],
    requirements: [
      "Tối thiểu 3 năm kinh nghiệm với ReactJS, thành thạo TypeScript.",
      "Hiểu sâu về Redux, React Query, và các pattern quản lý state.",
      "Kinh nghiệm với NextJS, SSR/SSG là một lợi thế lớn.",
      "Tiếng Anh đọc hiểu tài liệu kỹ thuật tốt.",
    ],
    benefits: [
      "Lương thưởng cạnh tranh, review lương 2 lần/năm.",
      "Bảo hiểm sức khỏe FPT Care cho bản thân và người thân.",
      "Làm việc hybrid, tối đa 3 ngày remote/tuần.",
      "13 tháng lương + thưởng dự án hấp dẫn.",
    ],
    company_info: {
      size: "10.000+ nhân viên",
      field: "Phần mềm & Dịch vụ CNTT",
      website: "fptsoftware.com",
      address: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
      about:
        "FPT Software là công ty phần mềm hàng đầu Việt Nam, cung cấp dịch vụ chuyển đổi số cho khách hàng toàn cầu tại hơn 30 quốc gia.",
    },
  },
  {
    id: "2",
    title: "Marketing Manager",
    company: "VNG Corporation",
    logo: "/logos/vng.png",
    salary: "30 - 45 triệu",
    salaryMin: 30,
    location: "Hồ Chí Minh",
    district: "Quận 7, Hồ Chí Minh",
    deadline: "15/09/2026",
    experience: "5",
    jobType: "Full-time",
    category: "Marketing",
    tags: ["Marketing", "Digital", "Branding"],
    hot: true,
    updatedAt: "5 giờ trước",
    description: [
      "Xây dựng và triển khai chiến lược marketing tổng thể cho các sản phẩm.",
      "Quản lý ngân sách marketing và tối ưu hiệu quả các chiến dịch.",
      "Dẫn dắt đội ngũ marketing, phối hợp với các phòng ban liên quan.",
      "Phân tích thị trường, đối thủ và đề xuất hướng phát triển thương hiệu.",
    ],
    requirements: [
      "Tối thiểu 5 năm kinh nghiệm marketing, 2 năm ở vị trí quản lý.",
      "Thành thạo Digital Marketing, Performance & Brand Marketing.",
      "Kỹ năng lãnh đạo, giao tiếp và trình bày xuất sắc.",
      "Tư duy dữ liệu, có khả năng đọc và phân tích số liệu.",
    ],
    benefits: [
      "Thu nhập hấp dẫn, thưởng KPI theo quý.",
      "Môi trường trẻ trung, năng động của công ty công nghệ hàng đầu.",
      "Chế độ chăm sóc sức khỏe cao cấp.",
      "Cơ hội đào tạo và thăng tiến rõ ràng.",
    ],
    company_info: {
      size: "5.000+ nhân viên",
      field: "Internet & Công nghệ",
      website: "vng.com.vn",
      address: "Z06 Đường số 13, Quận 7, TP.HCM",
      about:
        "VNG là kỳ lân công nghệ đầu tiên của Việt Nam, hoạt động trong lĩnh vực trò chơi trực tuyến, thanh toán, cloud và AI.",
    },
  },
  {
    id: "3",
    title: "Automation Tester (Manual & Auto)",
    company: "Techcombank",
    logo: "/logos/techbank.png",
    salary: "18 - 28 triệu",
    salaryMin: 18,
    location: "Hà Nội",
    district: "Hai Bà Trưng, Hà Nội",
    deadline: "20/08/2026",
    experience: "2",
    jobType: "Full-time",
    category: "Kiểm thử / QA",
    tags: ["Tester", "Automation", "Selenium"],
    hot: false,
    updatedAt: "1 ngày trước",
    description: [
      "Thiết kế test case, thực hiện kiểm thử manual và automation.",
      "Xây dựng và duy trì bộ test tự động với Selenium, Cypress.",
      "Phối hợp với Dev để phát hiện, theo dõi và xử lý bug.",
      "Đảm bảo chất lượng sản phẩm trước khi release.",
    ],
    requirements: [
      "Tối thiểu 2 năm kinh nghiệm kiểm thử phần mềm.",
      "Có kinh nghiệm với automation test (Selenium/Cypress/Appium).",
      "Hiểu về quy trình kiểm thử, viết test case chi tiết.",
      "Cẩn thận, tỉ mỉ và có tinh thần trách nhiệm cao.",
    ],
    benefits: [
      "Lương tháng 13, thưởng theo kết quả kinh doanh.",
      "Gói bảo hiểm ngân hàng cao cấp.",
      "Vay ưu đãi lãi suất cho nhân viên.",
      "Môi trường chuyên nghiệp bậc nhất ngành tài chính.",
    ],
    company_info: {
      size: "10.000+ nhân viên",
      field: "Tài chính & Ngân hàng",
      website: "techcombank.com",
      address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
      about:
        "Techcombank là một trong những ngân hàng thương mại cổ phần lớn nhất Việt Nam, tiên phong trong chuyển đổi số ngành tài chính.",
    },
  },
  {
    id: "4",
    title: "Nhân viên Kinh doanh B2B",
    company: "Shopee Mall",
    logo: "/logos/shopmall.png",
    salary: "12 - 20 triệu",
    salaryMin: 12,
    location: "Hồ Chí Minh",
    district: "Quận 1, Hồ Chí Minh",
    deadline: "25/08/2026",
    experience: "1",
    jobType: "Full-time",
    category: "Kinh doanh / Bán hàng",
    tags: ["Sales", "B2B", "Account"],
    hot: false,
    updatedAt: "1 ngày trước",
    description: [
      "Tìm kiếm và phát triển khách hàng doanh nghiệp mới.",
      "Tư vấn giải pháp bán hàng trên nền tảng thương mại điện tử.",
      "Chăm sóc, duy trì mối quan hệ với các đối tác hiện có.",
      "Đạt các chỉ tiêu doanh số được giao hàng tháng.",
    ],
    requirements: [
      "Tối thiểu 1 năm kinh nghiệm kinh doanh/sales.",
      "Kỹ năng giao tiếp và đàm phán tốt.",
      "Ưu tiên ứng viên có kinh nghiệm trong lĩnh vực TMĐT.",
      "Chủ động, chịu được áp lực doanh số.",
    ],
    benefits: [
      "Lương cứng + hoa hồng không giới hạn.",
      "Thưởng nóng theo tuần khi đạt target.",
      "Được đào tạo bài bản về sản phẩm và kỹ năng sales.",
      "Lộ trình thăng tiến lên Team Leader rõ ràng.",
    ],
    company_info: {
      size: "3.000+ nhân viên",
      field: "Thương mại điện tử",
      website: "shopee.vn",
      address: "Tòa nhà Saigon Centre, Quận 1, TP.HCM",
      about:
        "Shopee là nền tảng thương mại điện tử hàng đầu Đông Nam Á và Đài Loan, mang đến trải nghiệm mua sắm trực tuyến dễ dàng và an toàn.",
    },
  },
  {
    id: "5",
    title: "Frontend Developer (ReactJS) - Junior",
    company: "VNPAY",
    logo: "/logos/vpay.png",
    salary: "15 - 22 triệu",
    salaryMin: 15,
    location: "Hà Nội",
    district: "Nam Từ Liêm, Hà Nội",
    deadline: "10/09/2026",
    experience: "1",
    jobType: "Full-time",
    category: "Công nghệ thông tin",
    tags: ["ReactJS", "JavaScript", "CSS"],
    hot: true,
    updatedAt: "3 giờ trước",
    description: [
      "Phát triển giao diện người dùng cho các sản phẩm fintech.",
      "Chuyển đổi thiết kế Figma thành giao diện web chính xác.",
      "Làm việc với API, xử lý dữ liệu và tối ưu trải nghiệm.",
      "Học hỏi và áp dụng các công nghệ frontend mới.",
    ],
    requirements: [
      "Tối thiểu 1 năm kinh nghiệm với ReactJS.",
      "Nắm vững HTML, CSS, JavaScript (ES6+).",
      "Có kiến thức về responsive design và cross-browser.",
      "Ham học hỏi, có tinh thần cầu tiến.",
    ],
    benefits: [
      "Mức lương cạnh tranh cho vị trí Junior.",
      "Thưởng dự án, thưởng lễ tết đầy đủ.",
      "Được cấp trang thiết bị làm việc hiện đại.",
      "Team building, du lịch hàng năm.",
    ],
    company_info: {
      size: "2.000+ nhân viên",
      field: "Fintech & Thanh toán",
      website: "vnpay.vn",
      address: "22 Láng Hạ, Nam Từ Liêm, Hà Nội",
      about:
        "VNPAY là công ty công nghệ tài chính hàng đầu Việt Nam, tiên phong trong lĩnh vực thanh toán bằng mã QR.",
    },
  },
  {
    id: "6",
    title: "Digital Marketing Executive (Part-time)",
    company: "MoMo",
    logo: "/logos/momopay.png",
    salary: "8 - 12 triệu",
    salaryMin: 8,
    location: "Hồ Chí Minh",
    district: "Quận 3, Hồ Chí Minh",
    deadline: "05/09/2026",
    experience: "0",
    jobType: "Part-time",
    category: "Marketing",
    tags: ["Marketing", "Content", "SEO"],
    hot: false,
    updatedAt: "6 giờ trước",
    description: [
      "Lên kế hoạch và triển khai nội dung trên các kênh social media.",
      "Hỗ trợ chạy quảng cáo Facebook, Google Ads.",
      "Theo dõi và báo cáo hiệu quả các chiến dịch.",
      "Nghiên cứu xu hướng và đề xuất ý tưởng content.",
    ],
    requirements: [
      "Sinh viên năm cuối hoặc mới ra trường đều có thể ứng tuyển.",
      "Có kiến thức cơ bản về Digital Marketing.",
      "Kỹ năng viết content sáng tạo.",
      "Có thể làm việc tối thiểu 4 buổi/tuần.",
    ],
    benefits: [
      "Lương part-time hấp dẫn theo giờ.",
      "Thời gian làm việc linh hoạt.",
      "Được đào tạo thực chiến về marketing.",
      "Cơ hội trở thành nhân viên chính thức.",
    ],
    company_info: {
      size: "3.000+ nhân viên",
      field: "Ví điện tử & Fintech",
      website: "momo.vn",
      address: "Tòa nhà MoMo, Quận 3, TP.HCM",
      about:
        "MoMo là siêu ứng dụng ví điện tử số 1 Việt Nam với hơn 30 triệu người dùng, cung cấp đa dạng dịch vụ tài chính.",
    },
  },
  {
    id: "7",
    title: "Backend Developer (NodeJS/Golang)",
    company: "VNG Corporation",
    logo: "/logos/vng.png",
    salary: "22 - 35 triệu",
    salaryMin: 22,
    location: "Hồ Chí Minh",
    district: "Quận 7, Hồ Chí Minh",
    deadline: "18/09/2026",
    experience: "2",
    jobType: "Full-time",
    category: "Công nghệ thông tin",
    tags: ["NodeJS", "Golang", "Microservices"],
    hot: false,
    updatedAt: "8 giờ trước",
    description: [
      "Thiết kế và phát triển hệ thống backend microservices.",
      "Xây dựng API hiệu năng cao phục vụ hàng triệu người dùng.",
      "Tối ưu database và đảm bảo tính ổn định của hệ thống.",
      "Tham gia thiết kế kiến trúc hệ thống.",
    ],
    requirements: [
      "Tối thiểu 2 năm kinh nghiệm với NodeJS hoặc Golang.",
      "Hiểu biết về microservices, message queue, caching.",
      "Kinh nghiệm với PostgreSQL, Redis, Kafka.",
      "Tư duy logic tốt, khả năng giải quyết vấn đề.",
    ],
    benefits: [
      "Lương thưởng top thị trường.",
      "Cổ phiếu ESOP cho nhân viên xuất sắc.",
      "Môi trường kỹ thuật thử thách và học hỏi.",
      "Đầy đủ chế độ theo luật và phúc lợi công ty.",
    ],
    company_info: {
      size: "5.000+ nhân viên",
      field: "Internet & Công nghệ",
      website: "vng.com.vn",
      address: "Z06 Đường số 13, Quận 7, TP.HCM",
      about:
        "VNG là kỳ lân công nghệ đầu tiên của Việt Nam, hoạt động trong lĩnh vực trò chơi trực tuyến, thanh toán, cloud và AI.",
    },
  },
  {
    id: "8",
    title: "QA Lead / Trưởng nhóm Kiểm thử",
    company: "Techcombank",
    logo: "/logos/techbank.png",
    salary: "35 - 50 triệu",
    salaryMin: 35,
    location: "Hà Nội",
    district: "Hai Bà Trưng, Hà Nội",
    deadline: "28/08/2026",
    experience: "5",
    jobType: "Full-time",
    category: "Kiểm thử / QA",
    tags: ["Tester", "QA Lead", "Management"],
    hot: true,
    updatedAt: "12 giờ trước",
    description: [
      "Quản lý và dẫn dắt đội ngũ QA/Tester.",
      "Xây dựng chiến lược và quy trình kiểm thử cho toàn dự án.",
      "Đảm bảo chất lượng đầu ra của các sản phẩm ngân hàng số.",
      "Đào tạo, phát triển kỹ năng cho các thành viên trong team.",
    ],
    requirements: [
      "Tối thiểu 5 năm kinh nghiệm kiểm thử, 2 năm quản lý team.",
      "Am hiểu sâu về automation và performance testing.",
      "Kinh nghiệm trong lĩnh vực tài chính/ngân hàng là lợi thế.",
      "Kỹ năng lãnh đạo và tổ chức công việc tốt.",
    ],
    benefits: [
      "Thu nhập hấp dẫn cho vị trí quản lý.",
      "Gói phúc lợi ngân hàng đầy đủ và cao cấp.",
      "Cơ hội phát triển sự nghiệp lâu dài.",
      "Môi trường làm việc chuyên nghiệp.",
    ],
    company_info: {
      size: "10.000+ nhân viên",
      field: "Tài chính & Ngân hàng",
      website: "techcombank.com",
      address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
      about:
        "Techcombank là một trong những ngân hàng thương mại cổ phần lớn nhất Việt Nam, tiên phong trong chuyển đổi số ngành tài chính.",
    },
  },
]

export const savedCvOptions = [
  { value: "cv-1", label: "CV Lập trình viên Frontend - Cập nhật 08/2026" },
  { value: "cv-2", label: "CV Chuyên viên Marketing - Cập nhật 07/2026" },
  { value: "cv-3", label: "CV Tiếng Anh - IT Professional" },
]
