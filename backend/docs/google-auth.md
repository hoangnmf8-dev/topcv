# Đăng nhập Google

Frontend tạo state và cookie HttpOnly tại `/api/auth/google`, gọi backend `/auth/google` để nhận URL Google. Backend lưu state và PKCE verifier trong Redis trong 5 phút. Callback frontend kiểm tra state khớp cookie rồi gửi code/state tới POST `/auth/google/callback`. Backend tiêu thụ state một lần, đổi code và xác minh email. Frontend lưu cookie access/refresh token rồi chuyển đến dashboard theo vai trò.

## Cấu hình

- Backend `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth client loại Web application.
- `GOOGLE_CALLBACK_URL`: khớp chính xác Authorized redirect URI trên Google Console.
- URL hiện tại `http://localhost:3100/auth/google/callback` được giữ nguyên; backend chuyển tiếp về `/api/auth/google/callback` ở frontend.
- Backend `FRONTEND_URL`: origin frontend, mặc định `http://localhost:3000`. Cần đặt khi triển khai nếu dùng callback backend.
- Redis và Postgres phải hoạt động.

Tài khoản mới tạo hồ sơ candidate/company theo lựa chọn đăng ký. Tài khoản cũ giữ nguyên vai trò. `google_subject` nhận diện Google account ở lần đăng nhập sau. Chỉ tự liên kết email của tài khoản cũ khi Google quản lý email đó (Gmail hoặc Google Workspace); email bên thứ ba chưa liên kết cần đăng nhập bằng mật khẩu.

Migration `20261001000000_add_google_subject` thêm cột nullable và unique index, giữ nguyên ID và quan hệ. Bản sao lưu: `database/backups/topcv-20261001-before-google-auth.dump`.

## Kiểm tra

Backend: `npx tsx scripts/verify-google-auth.ts`. Google và thao tác ghi tài khoản được giả lập; state Redis tạm thời được xóa sau kiểm thử.

Frontend: `node scripts/verify-google-auth.cjs`. Kiểm tra state cookie, hủy đăng nhập, tạo phiên và lỗi backend bằng phản hồi giả lập.

Cần kiểm tra cuối bằng tài khoản Google thật trên trình duyệt để xác nhận OAuth client và redirect URI trên Google Console.

Tham khảo: https://developers.google.com/identity/protocols/oauth2/web-server và https://developers.google.com/identity/openid-connect/openid-connect.
