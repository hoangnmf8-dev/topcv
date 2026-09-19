import "dotenv/config";
import pg from "pg";

const { Client } = pg;
const seedPrefix = "[TOPCV-DEMO-20260917]";
const categories = [
  { code: "sales", name: "Kinh doanh / Bán hàng", target: 2685, titles: ["Chuyên viên Kinh doanh", "Nhân viên Phát triển Khách hàng", "Account Executive"], salary: [10, 28] },
  { code: "marketing", name: "Marketing / Truyền thông", target: 1595, titles: ["Chuyên viên Digital Marketing", "Content Marketing Executive", "Social Media Executive"], salary: [12, 30] },
  { code: "customer-service", name: "Chăm sóc khách hàng", target: 840, titles: ["Chuyên viên Chăm sóc Khách hàng", "Customer Success Executive", "Nhân viên Tổng đài"], salary: [9, 20] },
  { code: "hr-admin", name: "Nhân sự / Hành chính", target: 734, titles: ["Chuyên viên Tuyển dụng", "Chuyên viên C&B", "Nhân viên Hành chính Nhân sự"], salary: [10, 24] },
  { code: "it", name: "Công nghệ thông tin", target: 1825, titles: ["Lập trình viên Frontend", "Lập trình viên Backend", "Kỹ sư Kiểm thử phần mềm"], salary: [18, 45] },
  { code: "finance-banking", name: "Tài chính / Ngân hàng", target: 1084, titles: ["Chuyên viên Quan hệ Khách hàng", "Chuyên viên Tư vấn Tài chính", "Chuyên viên Phân tích Tín dụng"], salary: [12, 32] },
  { code: "real-estate", name: "Bất động sản", target: 388, titles: ["Chuyên viên Kinh doanh Bất động sản", "Chuyên viên Tư vấn Đầu tư", "Chuyên viên Phát triển Dự án"], salary: [10, 35] },
  { code: "accounting-audit", name: "Kế toán / Kiểm toán", target: 1263, titles: ["Kế toán Tổng hợp", "Kế toán Thuế", "Chuyên viên Kiểm toán Nội bộ"], salary: [12, 30] },
];
const copy = {
  description: (title, company) => `${seedPrefix}\n${company} đang tìm kiếm ${title} để đồng hành cùng đội ngũ.\n\n- Thực hiện công việc theo kế hoạch của phòng ban.\n- Phối hợp với các bộ phận liên quan để hoàn thành mục tiêu.\n- Báo cáo tiến độ và đề xuất phương án cải thiện.`,
  requirements: (experience) => `- Có tối thiểu ${experience} năm kinh nghiệm phù hợp.\n- Có kỹ năng giao tiếp, chủ động và tinh thần trách nhiệm.\n- Sử dụng tốt các công cụ phục vụ công việc.`,
  benefits: `- Thu nhập cạnh tranh và thưởng theo hiệu quả công việc.\n- Được tham gia đầy đủ chế độ bảo hiểm theo quy định.\n- Cơ hội đào tạo và phát triển nghề nghiệp rõ ràng.`,
};
const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  await client.query("BEGIN");
  const categoryByCode = new Map();
  for (const category of categories) {
    const result = await client.query(
      `INSERT INTO job_category (id, name, code, description, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, true, now(), now())
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true, deleted_at = null, updated_at = now()
       RETURNING id, code`,
      [category.name, category.code, `Danh mục ${category.name}`],
    );
    categoryByCode.set(category.code, result.rows[0].id);
  }
  const titleByKey = new Map();
  for (const category of categories) for (const [index, title] of category.titles.entries()) {
    const code = `${category.code}-${index + 1}`;
    const result = await client.query(
      `INSERT INTO job_title (id, job_category_id, code, name, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, now(), now())
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_category_id = EXCLUDED.job_category_id, deleted_at = null, updated_at = now()
       RETURNING id`,
      [categoryByCode.get(category.code), code, title],
    );
    titleByKey.set(code, result.rows[0].id);
  }
  const companies = (await client.query("SELECT id, name, location_id FROM company WHERE deleted_at IS NULL ORDER BY name")).rows;
  const fallbackLocation = (await client.query("SELECT id FROM province WHERE name = 'Hà Nội' LIMIT 1")).rows[0]?.id;
  if (!companies.length || !fallbackLocation) throw new Error("Cần có ít nhất một công ty và tỉnh Hà Nội trước khi seed job post.");
  let inserted = 0;
  for (const category of categories) {
    const categoryId = categoryByCode.get(category.code);
    const current = await client.query("SELECT count(*)::int AS count FROM job_post WHERE job_category_id = $1 AND deleted_at IS NULL", [categoryId]);
    const needed = Math.max(0, category.target - current.rows[0].count);
    for (let start = 0; start < needed; start += 200) {
      const values = [];
      const rows = [];
      for (let offset = 0; offset < Math.min(200, needed - start); offset += 1) {
        const index = start + offset;
        const titleIndex = index % category.titles.length;
        const company = companies[(inserted + index) % companies.length];
        const experience = [0, 1, 2, 3, 4][index % 5];
        const salaryMin = category.salary[0] + (index % 4) * 2;
        const salaryMax = Math.max(salaryMin + 6, category.salary[1] + (index % 3) * 2);
        const title = `${category.titles[titleIndex]}${index % 2 === 0 ? "" : " (Ưu tiên ứng viên có kinh nghiệm)"}`;
        const base = values.length;
        values.push(company.id, titleByKey.get(`${category.code}-${titleIndex + 1}`), categoryId, company.location_id ?? fallbackLocation, title, copy.description(title, company.name), copy.requirements(experience), copy.benefits, salaryMin * 1_000_000, salaryMax * 1_000_000, ["full_time", "hybrid", "remote"][index % 3], experience, index % 9 === 0);
        rows.push(`(gen_random_uuid(), $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, 'VND', $${base + 11}, $${base + 12}, now() + interval '30 days', 'published', now(), $${base + 13}, now(), now())`);
      }
      await client.query(`INSERT INTO job_post (id, company_id, job_title_id, job_category_id, location_id, title, description, requirements, benefits, salary_min, salary_max, currency, employment_type, experience_years_min, deadline_at, status, published_at, is_boosted, created_at, updated_at) VALUES ${rows.join(", ")}`, values);
    }
    inserted += needed;
  }
  await client.query("COMMIT");
  console.log(`Đã thêm ${inserted} job post mẫu, đúng tổng theo từng ngành và có tin boost.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
