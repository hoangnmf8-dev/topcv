# TopCV – Single Next.js project (UI preserved)

Bản này **không redesign UI**. Mục tiêu là chuyển các màn hình trong `topcv.zip` thành **một ứng dụng Next.js duy nhất**, giữ nguyên JSX, Tailwind classes, dữ liệu mock, icon, hình ảnh, component UI và các flow đang có.

## Công nghệ

- Next.js App Router
- React 19
- Tailwind CSS 4
- shadcn/ui (các component shadcn đã có sẵn trong `components/ui`)
- Base UI / Radix-compatible primitives được project gốc sử dụng
- Lucide React

## Chạy project

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Các route được gom từ project gốc

- `/` – Home / tìm kiếm việc làm
- `/auth` – Đăng nhập / đăng ký
- `/candidate` – Candidate Dashboard
- `/cv-builder` – CV Builder
- `/employer` – Employer Dashboard
- `/employer/post-job` – Employer Post Job / QR
- `/admin` – Admin Dashboard

## Nguyên tắc chuyển đổi

1. Không thay layout hoặc thiết kế lại màn hình.
2. Không thay nội dung mock data của các màn hình gốc.
3. Không đổi các Tailwind class đã có trừ các import/runtime cần thiết.
4. Các màn hình TanStack Router/Vite chỉ bỏ `createFileRoute` và chuyển thành Next App Router page.
5. Các component Next.js gốc (`home`, `auth`, `cv-builder`) được giữ lại và dùng chung trong project.
6. Alias `@/*` được cấu hình trong `tsconfig.json`.
7. Logo của từng màn hình Vite được giữ riêng trong `public/assets` để tránh xung đột tên `/logo.png`.

## Lưu ý

Các màn hình trong file gốc chủ yếu là UI/mock flow. Việc gom project không tự tạo backend thật cho PostgreSQL, authentication, payment hoặc các API nghiệp vụ chưa có trong source ban đầu.
