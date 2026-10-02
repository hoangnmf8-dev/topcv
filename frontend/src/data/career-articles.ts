import type { CareerArticle } from "@/types/career";

const meeting = { image: "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?auto=format&fit=crop&w=1200&q=80", imageAlt: "Đồng nghiệp trao đổi trong phòng họp", imageCredit: "Christina @ wocintechchat.com / Unsplash", imageSource: "https://unsplash.com/photos/Q80LYxv_Tbs" };
const discussion = { image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80", imageAlt: "Nhóm làm việc trao đổi quanh bàn với laptop và sổ ghi chép", imageCredit: "Headway / Unsplash", imageSource: "https://unsplash.com/photos/5QgIuuBxKwM" };
const desk = { image: "https://images.unsplash.com/photo-1657524433787-a30cefc92661?auto=format&fit=crop&w=1200&q=80", imageAlt: "Laptop trên bàn làm việc cạnh cửa sổ", imageCredit: "Lasse Jensen / Unsplash", imageSource: "https://unsplash.com/photos/fSSO5U_iwzk" };
const common = { author: "Cẩm nang TopCV", publishedAt: "02/10/2026" };

export const careerArticles: CareerArticle[] = [
  {
    ...common, ...desk, slug: "viet-cv-ro-rang-va-thuyet-phuc", category: "Bí kíp tìm việc", categoryId: "job-search", readTime: "4 phút",
    title: "Viết CV rõ ràng: để nhà tuyển dụng nhìn thấy giá trị của bạn",
    excerpt: "Chọn thông tin phù hợp, viết kinh nghiệm bằng kết quả và kiểm tra hồ sơ trước khi gửi.",
    intro: "Một CV tốt giúp người đọc hiểu bạn phù hợp với vị trí nào và có bằng chứng gì cho sự phù hợp đó. Bạn không cần đưa tất cả trải nghiệm vào một hồ sơ; hãy ưu tiên những điều liên quan đến công việc đang ứng tuyển.",
    sections: [
      { title: "Bắt đầu từ mô tả công việc", paragraphs: ["Đọc kỹ nhiệm vụ, yêu cầu kỹ năng và sản phẩm mà vị trí cần tạo ra. Chọn ba đến năm yêu cầu quan trọng rồi đối chiếu với những việc bạn thực sự đã làm. Điều chỉnh cách trình bày để kinh nghiệm liên quan xuất hiện trước, nhưng không bổ sung kỹ năng mình chưa có."], bullets: ["Tiêu đề CV thể hiện vị trí mục tiêu.", "Thông tin liên hệ chính xác và email dễ nhận diện.", "Tóm tắt ngắn về kinh nghiệm và thế mạnh liên quan."] },
      { title: "Thay danh sách nhiệm vụ bằng bằng chứng", paragraphs: ["Viết theo cấu trúc: bạn làm gì, trong bối cảnh nào và kết quả ra sao. Ví dụ, thay vì ‘quản lý nội dung’, có thể viết ‘lập lịch và triển khai 12 bài viết mỗi tháng cho trang sản phẩm’. Chỉ dùng số liệu có thể giải thích được khi phỏng vấn.", "Nếu chưa có kinh nghiệm, hãy dùng dự án môn học, hoạt động tình nguyện hoặc sản phẩm cá nhân. Nêu rõ phần việc của mình trong nhóm và dẫn liên kết tới sản phẩm nếu có."] },
      { title: "Kiểm tra trước khi gửi", paragraphs: ["Xuất PDF rồi mở lại trên máy tính và điện thoại để kiểm tra xuống dòng, lỗi font và liên kết. Đặt tên tệp dễ tìm, chẳng hạn Nguyen-Minh-Anh-CV-Marketing.pdf. Giữ một bản CV riêng cho từng nhóm vị trí thay vì sửa bản đã gửi mà không lưu lại."], bullets: ["Rà soát chính tả, mốc thời gian và thông tin liên hệ.", "Không đưa thông tin cá nhân nhạy cảm không cần thiết.", "Kiểm tra quyền truy cập của các liên kết portfolio."] },
    ],
  },
  {
    ...common, ...discussion, slug: "chon-huong-nghe-nghiep-va-chuan-bi-phong-van", category: "Định hướng nghề nghiệp", categoryId: "orientation", readTime: "5 phút",
    title: "Chọn hướng nghề nghiệp bằng những thử nghiệm nhỏ",
    excerpt: "Đừng chỉ chọn nghề theo tên gọi. Hãy tìm hiểu công việc thực tế, thử một nhiệm vụ và chuẩn bị câu chuyện cho buổi phỏng vấn.",
    intro: "Định hướng nghề nghiệp không nhất thiết bắt đầu bằng một quyết định lớn. Những thử nghiệm nhỏ giúp bạn tìm hiểu mình thích loại công việc nào, cần phát triển kỹ năng gì và môi trường nào phù hợp.",
    sections: [
      { title: "Tách sở thích khỏi công việc hằng ngày", paragraphs: ["Bạn có thể thích một lĩnh vực nhưng chưa thích những nhiệm vụ lặp lại của nghề trong lĩnh vực đó. Hãy đọc vài mô tả tuyển dụng cùng vị trí, ghi lại nhiệm vụ chung và hỏi người đang làm nghề về một ngày làm việc bình thường.", "Đối chiếu với thế mạnh của bạn: phân tích số liệu, giao tiếp, viết, thiết kế hay tổ chức công việc. Cân nhắc cả điều kiện thực tế như địa điểm, giờ làm và khả năng học thêm."] },
      { title: "Thử một nhiệm vụ trước khi chọn", paragraphs: ["Chọn một sản phẩm nhỏ có thể hoàn thành trong một hoặc hai tuần. Người quan tâm phân tích dữ liệu có thể làm báo cáo từ bộ dữ liệu công khai; người muốn làm nội dung có thể viết một bài theo brief. Sau đó xin phản hồi cụ thể về chất lượng sản phẩm."], bullets: ["Ghi lại phần việc khiến bạn hứng thú và phần việc khiến bạn khó tập trung.", "Đánh giá cả quá trình, không chỉ kết quả cuối cùng.", "Thử thêm một hướng khác trước khi kết luận."] },
      { title: "Biến trải nghiệm thành câu chuyện phỏng vấn", paragraphs: ["Chuẩn bị một ví dụ theo thứ tự: tình huống, nhiệm vụ, hành động và kết quả. Nêu rõ điều bạn trực tiếp làm và bài học rút ra. Khi chưa biết một kỹ năng, giải thích cách bạn dự định học thay vì khẳng định đã thành thạo.", "Cuối buổi phỏng vấn, hỏi về nhiệm vụ trong ba tháng đầu, cách đánh giá kết quả và người hỗ trợ bạn. Những câu trả lời này giúp bạn kiểm tra mức độ phù hợp của vị trí."] },
    ],
  },
  {
    ...common, ...meeting, slug: "danh-gia-offer-va-trao-doi-luong", category: "Lương & phúc lợi", categoryId: "salary", readTime: "4 phút",
    title: "Đánh giá offer: nhìn vào toàn bộ công việc và phúc lợi",
    excerpt: "Một bảng so sánh đơn giản giúp bạn làm rõ thu nhập, điều kiện làm việc và cơ hội phát triển trước khi nhận lời.",
    intro: "Mức lương là một phần của offer. Bạn cũng cần hiểu cách tính thu nhập, phạm vi công việc, điều kiện làm việc và cơ hội phát triển để quyết định phù hợp với ưu tiên của mình.",
    sections: [
      { title: "Làm rõ các thành phần trong offer", paragraphs: ["Hỏi rõ con số được đề xuất là gross hay net, khoản nào cố định và khoản nào phụ thuộc kết quả. Không xem thưởng chưa được cam kết là thu nhập chắc chắn. Nếu có điểm chưa rõ, đề nghị người tuyển dụng giải thích bằng văn bản."], bullets: ["Mức lương, phụ cấp và điều kiện nhận thưởng.", "Thời gian làm việc, địa điểm và thiết bị được cấp.", "Phạm vi nhiệm vụ, người quản lý và tiêu chí đánh giá.", "Thời điểm bắt đầu và thời hạn phản hồi offer."] },
      { title: "So sánh theo ưu tiên cá nhân", paragraphs: ["Lập bảng cho từng offer theo ba đến năm tiêu chí quan trọng nhất. Nếu ưu tiên học nghề, chất lượng hướng dẫn có thể quan trọng hơn một chênh lệch nhỏ về lương. Nếu cần ổn định lịch sinh hoạt, hãy hỏi cụ thể về lịch làm việc thay vì suy đoán từ tên công ty.", "Cân nhắc chi phí đi lại và thời gian di chuyển. Một mức thu nhập cao hơn chưa chắc đem lại trải nghiệm phù hợp hơn nếu điều kiện làm việc đi ngược nhu cầu của bạn."] },
      { title: "Trao đổi bằng căn cứ và giữ thái độ hợp tác", paragraphs: ["Nêu kỳ vọng cùng lý do liên quan đến năng lực và trách nhiệm của vị trí. Bạn có thể nói: ‘Với phạm vi công việc đã trao đổi, tôi mong mức thu nhập ở khoảng …; công ty có thể cân nhắc thêm không?’. Tránh đưa ra một offer khác không có thật để gây áp lực.", "Khi đạt thỏa thuận, đề nghị cập nhật offer bằng văn bản. Đọc lại các điều kiện trước khi nhận lời và giữ bản xác nhận để đối chiếu khi bắt đầu làm việc."] },
    ],
  },
  {
    ...common, ...desk, slug: "xay-dung-bang-chung-nang-luc", category: "Kỹ năng chuyên môn", categoryId: "skills", readTime: "4 phút",
    title: "Biến kiến thức thành bằng chứng năng lực với một dự án nhỏ",
    excerpt: "Một sản phẩm có mục tiêu, cách thực hiện và kết quả rõ ràng giúp portfolio thuyết phục hơn danh sách khóa học.",
    intro: "Portfolio không cần nhiều dự án. Một sản phẩm được làm kỹ, có giải thích về quyết định và giới hạn của nó có thể giúp nhà tuyển dụng hiểu cách bạn tiếp cận công việc.",
    sections: [
      { title: "Chọn vấn đề sát với vị trí mục tiêu", paragraphs: ["Bắt đầu từ một nhiệm vụ thường gặp trong công việc: lập kế hoạch nội dung, thiết kế luồng đăng ký hoặc phân tích một bộ dữ liệu. Thu hẹp phạm vi để có sản phẩm hoàn chỉnh thay vì một dự án lớn chưa thể kết thúc.", "Viết ngắn gọn người sử dụng là ai, vấn đề cần giải quyết và tiêu chí hoàn thành. Đặt thời hạn thực tế để biết khi nào nên dừng mở rộng phạm vi."] },
      { title: "Ghi lại cách làm và kết quả", paragraphs: ["Mỗi dự án nên có phần mô tả vấn đề, cách thực hiện, sản phẩm và bài học. Nếu làm theo nhóm, nêu rõ phần việc của bạn. Trình bày cả một quyết định chưa hiệu quả và cách bạn đã điều chỉnh; điều này giúp người đọc hiểu quá trình làm việc."], bullets: ["Ảnh chụp hoặc đường dẫn tới sản phẩm có thể xem được.", "Nguồn dữ liệu và công cụ đã sử dụng.", "Kết quả đo được hoặc phản hồi của người thử.", "Giới hạn và việc bạn muốn cải thiện tiếp theo."] },
      { title: "Đưa dự án vào CV và tiếp tục cải thiện", paragraphs: ["Trong CV, tóm tắt dự án thành hai hoặc ba ý: mục tiêu, đóng góp và kết quả. Dẫn liên kết tới bản trình bày chi tiết. Trước khi chia sẻ, kiểm tra quyền truy cập và loại bỏ dữ liệu cá nhân hoặc thông tin nội bộ.", "Xin phản hồi bằng câu hỏi cụ thể, chẳng hạn ‘phần nào chưa dễ hiểu?’ hoặc ‘kết quả nào cần thêm bằng chứng?’. Cập nhật sản phẩm theo phản hồi và ghi lại phiên bản để thấy sự tiến bộ của mình."] },
    ],
  },
];
