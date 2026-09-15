export type CareerArticle = {
  slug: string
  category: string
  title: string
  excerpt: string
  readTime: string
  publishedAt: string
  author: string
  intro: string
  sections: { title: string; paragraphs: string[]; bullets?: string[] }[]
}

export const careerArticles: CareerArticle[] = [
  {
    slug: "viet-cv-thuyet-phuc-nha-tuyen-dung",
    category: "Bí kíp tìm việc",
    title: "6 cách viết CV khiến nhà tuyển dụng muốn đọc tiếp",
    excerpt: "Biến kinh nghiệm thành thành tích có số liệu, sắp xếp nội dung theo vị trí và loại bỏ thông tin không cần thiết.",
    readTime: "7 phút",
    publishedAt: "28/08/2026",
    author: "TopCV Career Team",
    intro: "Một CV tốt không cần dài, nhưng phải giúp nhà tuyển dụng nhanh chóng nhìn thấy mức độ phù hợp của bạn với vị trí đang tuyển.",
    sections: [
      { title: "Bắt đầu từ yêu cầu của vị trí", paragraphs: ["Đọc kỹ mô tả công việc, đánh dấu kỹ năng, công cụ và kết quả mà doanh nghiệp nhắc lại nhiều lần. Đây là nhóm từ khóa nên xuất hiện tự nhiên trong phần tóm tắt và kinh nghiệm của bạn."], bullets: ["Ưu tiên 5–7 từ khóa quan trọng nhất", "Không sao chép nguyên văn mô tả công việc", "Đưa kỹ năng vào đúng ngữ cảnh đã sử dụng"] },
      { title: "Viết thành tích thay cho nhiệm vụ", paragraphs: ["Mỗi gạch đầu dòng nên trả lời được bạn đã làm gì, bằng cách nào và tạo ra kết quả gì. Khi chưa có số liệu tuyệt đối, có thể dùng tỷ lệ, quy mô nhóm hoặc thời gian hoàn thành."], bullets: ["Tăng tỷ lệ chuyển đổi 18% sau 3 tháng", "Rút ngắn thời gian xử lý từ 2 ngày xuống 6 giờ", "Phối hợp cùng nhóm 6 thành viên triển khai sản phẩm"] },
      { title: "Kiểm tra trước khi gửi", paragraphs: ["Giữ CV trong 1–2 trang, thống nhất cách viết thời gian và xuất PDF để tránh vỡ bố cục. Tên file nên gồm họ tên và vị trí ứng tuyển."] },
    ],
  },
  {
    slug: "deal-luong-cung-co-loi",
    category: "Lương & phúc lợi",
    title: "Deal lương thế nào để cả hai bên cùng có lợi?",
    excerpt: "Chuẩn bị khoảng lương mục tiêu, chứng minh giá trị và xem xét tổng gói đãi ngộ thay vì chỉ nhìn lương cứng.",
    readTime: "6 phút",
    publishedAt: "25/08/2026",
    author: "TopCV Career Team",
    intro: "Đàm phán lương hiệu quả là cuộc trao đổi dựa trên dữ liệu, phạm vi công việc và giá trị bạn có thể mang lại, không phải một lần mặc cả.",
    sections: [
      { title: "Xác định khoảng lương có cơ sở", paragraphs: ["Tham khảo mức lương theo vị trí, số năm kinh nghiệm, địa điểm và quy mô doanh nghiệp. Chọn một khoảng thay vì một con số cứng để còn không gian trao đổi."], bullets: ["Mức tối thiểu có thể chấp nhận", "Mức mục tiêu hợp lý", "Mức kỳ vọng khi phạm vi công việc lớn hơn"] },
      { title: "Nói bằng giá trị", paragraphs: ["Liên hệ kỳ vọng thu nhập với các kết quả bạn từng tạo ra, năng lực hiếm và trách nhiệm của vị trí mới. Tránh dùng lý do chi phí cá nhân làm luận điểm chính."] },
      { title: "Đánh giá tổng đãi ngộ", paragraphs: ["Ngoài lương cứng, hãy hỏi rõ thưởng, bảo hiểm, ngày phép, hỗ trợ học tập, hình thức làm việc và chu kỳ xét tăng lương. Luôn xác nhận offer cuối cùng bằng văn bản."] },
    ],
  },
  {
    slug: "lo-trinh-su-nghiep-90-ngay",
    category: "Định hướng nghề nghiệp",
    title: "Lập bản đồ nghề nghiệp trong 90 ngày",
    excerpt: "Chia mục tiêu lớn thành các mốc kỹ năng, dự án và mối quan hệ có thể đo lường theo từng tuần.",
    readTime: "8 phút",
    publishedAt: "20/08/2026",
    author: "TopCV Career Team",
    intro: "Kế hoạch 90 ngày đủ dài để tạo ra kết quả có ý nghĩa và đủ ngắn để bạn duy trì sự tập trung, đo lường tiến độ mỗi tuần.",
    sections: [
      { title: "30 ngày đầu: chọn đích đến", paragraphs: ["Chọn một vị trí mục tiêu, phân tích 10 tin tuyển dụng thực tế và xác định ba khoảng trống năng lực quan trọng nhất."], bullets: ["Hoàn thiện hồ sơ năng lực hiện tại", "Chọn một kỹ năng trọng tâm", "Đặt chỉ số tiến độ theo tuần"] },
      { title: "30 ngày tiếp: tạo bằng chứng", paragraphs: ["Xây dựng một dự án nhỏ giải quyết vấn đề thực tế. Ghi lại quyết định, công cụ, khó khăn và kết quả để có thể đưa vào CV hoặc portfolio."] },
      { title: "30 ngày cuối: đưa ra thị trường", paragraphs: ["Xin phản hồi từ người có kinh nghiệm, cập nhật CV và bắt đầu ứng tuyển có chọn lọc. Sau mỗi cuộc phỏng vấn, ghi lại điểm cần cải thiện cho vòng tiếp theo."], bullets: ["Kết nối 3 người trong ngành mỗi tuần", "Ứng tuyển 3–5 vị trí phù hợp", "Đánh giá và điều chỉnh sau mỗi 7 ngày"] },
    ],
  },
  {
    slug: "xay-dung-bang-chung-nang-luc",
    category: "Kỹ năng chuyên môn",
    title: "Biến kỹ năng thành bằng chứng năng lực",
    excerpt: "Cách xây dựng dự án thực hành và trình bày kết quả để nhà tuyển dụng hiểu đúng năng lực của bạn.",
    readTime: "5 phút",
    publishedAt: "18/08/2026",
    author: "TopCV Career Team",
    intro: "Danh sách kỹ năng chỉ là lời khẳng định. Một sản phẩm có bối cảnh, cách làm và kết quả rõ ràng mới là bằng chứng thuyết phục.",
    sections: [
      { title: "Chọn bài toán sát công việc", paragraphs: ["Bắt đầu từ một nhiệm vụ thường xuất hiện trong mô tả công việc mục tiêu. Giới hạn phạm vi để có thể hoàn thiện trong hai đến bốn tuần."] },
      { title: "Ghi lại quá trình", paragraphs: ["Trình bày vấn đề, vai trò, lựa chọn chuyên môn và tiêu chí đánh giá. Nếu làm theo nhóm, nói rõ phần việc do bạn chịu trách nhiệm."], bullets: ["Bối cảnh và mục tiêu", "Công cụ và quyết định chính", "Kết quả cùng bài học rút ra"] },
      { title: "Đưa bằng chứng vào hồ sơ", paragraphs: ["Thêm liên kết dự án vào CV, portfolio hoặc hồ sơ công khai. Một mô tả ngắn có kết quả cụ thể hiệu quả hơn ảnh chụp không có giải thích."] },
    ],
  },
]

export function getCareerArticle(slug: string) {
  return careerArticles.find((article) => article.slug === slug)
}
