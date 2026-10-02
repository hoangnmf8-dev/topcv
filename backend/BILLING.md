# Hoàn tất cấu hình thanh toán payOS

1. Đăng ký tại https://my.payos.vn, hoàn tất xác thực cá nhân/doanh nghiệp, liên kết ngân hàng và tạo kênh thanh toán.
2. Thêm các biến từ `.env.billing.example` vào `backend/.env`. Lấy Client ID, API Key, Checksum Key từ kênh. Nhập giá Pro bằng số nguyên VND, không dấu phân cách. Không gửi khóa trong chat hay đưa vào frontend.
3. Trong thư mục backend, chạy `npx prisma migrate deploy`, `npx prisma generate`, `npm run seed:service-plans`.
4. Chạy backend bằng `npm run dev`, worker bằng `npm run worker` (terminal riêng), và frontend bằng `npm run dev` trong thư mục frontend. PostgreSQL và Redis phải hoạt động.
5. Cấu hình webhook trên kênh payOS: `https://TEN-MIEN-BACKEND/billing/webhook/payos`. Khi chạy local, cần tunnel HTTPS đến cổng backend (mặc định 3100). localhost không thể nhận webhook từ payOS. Không cần public PostgreSQL hay Redis.
6. `PAYMENT_RETURN_URL` là URL frontend `/billing/orders`, khác với URL webhook. Nếu thử trên cùng máy có thể dùng `http://localhost:3000/billing/orders`. Khi deploy dùng URL HTTPS frontend và cập nhật CORS, realtime origin, biến NEXT_PUBLIC_BACKEND_API cùng cấu hình auth của dự án cho domain thực tế.
7. Khởi động lại backend/worker sau khi đổi biến môi trường. Mở `/services` hoặc `/employer/services`, kiểm tra giá và nút mua Pro.
8. Tự thực hiện một giao dịch giá trị nhỏ trên tài khoản thử riêng. payOS hiện không có sandbox riêng, giao dịch thử là tiền thật. Kiểm tra Payment succeeded, Order paid, một Subscription được cấp, quyền Pro có hiệu lực. Dùng nút kiểm tra thanh toán nếu webhook đến chậm. Xác minh mua tiếp nối thời hạn và Premium không mua được. Sau thử nghiệm, đổi lại giá chính thức và chạy seed lần nữa.

Free là quyền mặc định, không tạo đơn. Chỉ xác nhận từ webhook đã kiểm tra chữ ký hoặc truy vấn backend đến payOS mới cấp Pro; URL quay về không cấp quyền.

Quyền lợi được cấu hình bằng `entitlements` (code, tên, kiểu number/boolean/string) và `plan_entitlements` (gói, quyền, giá trị JSON). Các code hiện có: `cvLimit`, `aiLimit`, `activeJobLimit`. Metadata của gói không còn là nguồn kiểm tra quyền. API danh sách gói vẫn trả `metadata.benefits` để tương thích giao diện, nhưng lấy dữ liệu từ bảng quyền.

Đơn hàng chốt quyền vào `planSnapshot.benefits`. Subscription quản lý thời hạn và `usageState` (ví dụ `aiLimit: { used, reserved }`); quyền gói trả phí đọc từ snapshot Order. Bảng QuotaUsage đã được chuyển dữ liệu và bỏ. Free có Subscription không có Order, tạo theo tháng lịch Việt Nam khi sử dụng AI; quyền Free đọc từ cấu hình gói. Số còn lại là giới hạn trừ used và reserved. Giữ chỗ và hoàn tất AI đều khóa Subscription trong transaction. Subscription Free không làm lùi ngày bắt đầu Pro và không được hiển thị như gói trả phí.

Quyền ứng viên gồm cvLimit, aiLimit và các mô tả tìm việc/CV; nhà tuyển dụng gồm activeJobLimit và các mô tả tuyển dụng. Nội dung dạng string trong PlanEntitlement được hiển thị trên trang gói, không dùng làm bộ đếm. Seed chỉ bổ sung quyền thiếu. Số CV và tin đang tuyển vẫn đếm trực tiếp. Thêm quyền mới cần bổ sung kiểm tra tại chức năng sử dụng tương ứng.

Kiểm tra kỹ thuật: backend `npm run typecheck`, `npm run test:billing`; frontend `npm run typecheck` và `npm run build`. Kiểm thử tích hợp dùng dữ liệu tạm và mock storage, không tạo thanh toán thật.

Tài liệu chính thức: https://payos.vn/docs/huong-dan-su-dung/tao-kenh-thanh-toan/ và https://payos.vn/docs/moi-truong-test/.
