"use client";
import { useState, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { vi } from "react-day-picker/locale";
import { formatJobSalary } from "@/lib/job-salary";
import { httpRequest } from "@/lib/utils";
import axios from "axios";
import { JOB_TEXT_LIMITS } from "@/lib/content-limits";
import aiService from "@/services/ai.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MapPin,
  CalendarDays,
  UsersRound,
  Sparkles,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";
import { EmployerHeader } from "@/components/employer-header";
import { RoleFooter } from "@/components/role-footer";
import { useQuery } from "@tanstack/react-query";
import locationService from "@/services/location.service";
import jobCategoryService from "@/services/job-category.service";
import { provinceKey, jobCategoryKey } from "@/cache-key";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const initial = {
  title: "",
  category: "",
  jobTitleId: "",
  provinceId: "",
  wardId: "",
  address: "",
  salaryMin: "",
  salaryMax: "",
  currency: "triệu VNĐ/tháng",
  negotiable: true,
  experience: "",
  saturdaySchedule: "UNSPECIFIED" as "WORK" | "OFF" | "UNSPECIFIED",
  overviewRequirements: "",
  deadline: "",
  description: "",
  requirements: "",
  benefits: "",
  skills: "",
};
type Data = typeof initial;
const salaryValue = (value: string, currency: string) =>
  value.trim() === ""
    ? null
    : Number(value) * (currency === "triệu VNĐ/tháng" ? 1000000 : 1);
const money = (d: Data) =>
  formatJobSalary(
    d.negotiable ? null : salaryValue(d.salaryMin, d.currency),
    d.negotiable ? null : salaryValue(d.salaryMax, d.currency),
    d.currency === "USD/tháng" ? "USD" : "VND",
  );
const splitTags = (value: string) => [
  ...new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];

export default function Page() {
  const router = useRouter();
  const [step, setStep] = useState(0),
    [data, setData] = useState<Data>(initial);
  const [previewOpen, setPreviewOpen] = useState(false);
  const provinces = useQuery({
    queryKey: provinceKey,
    queryFn: ({ signal }) => locationService.getProvince(signal),
    staleTime: 300000,
  });
  const categories = useQuery({
    queryKey: jobCategoryKey,
    queryFn: ({ signal }) => jobCategoryService.getJobCategory(signal),
    staleTime: 300000,
  });
  const wards = useQuery({
    queryKey: ["wards", data.provinceId],
    queryFn: ({ signal }) => locationService.getWards(data.provinceId, signal),
    enabled: !!data.provinceId,
    staleTime: 300000,
  });
  const jobTitles =
    categories.data?.data.find((item) => item.id === data.category)
      ?.jobTitles ?? [];
  const province = provinces.data?.data.find(
    (item) => item.id === data.provinceId,
  );
  const ward = wards.data?.find(
    (item) => item.id === data.wardId && item.provinceId === data.provinceId,
  );
  const previewData = {
    ...data,
    location: [data.address.trim(), ward?.fullName, province?.name]
      .filter(Boolean)
      .join(", "),
  };
  const addressInvalid = !province || !ward || !data.address.trim();
  const set = <K extends keyof Data>(k: K, v: Data[K]) =>
    setData((x) => ({ ...x, [k]: v }));
  const [publishing, setPublishing] = useState(false);
  const publishLock = useRef(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const changeSalary = (key: "salaryMin" | "salaryMax", value: string) =>
    setData((current) => {
      const next = { ...current, [key]: value };
      return {
        ...next,
        negotiable:
          next.salaryMin.trim() === "" && next.salaryMax.trim() === "",
      };
    });
  const invalid =
    !data.negotiable &&
    ([data.salaryMin, data.salaryMax].some(
      (value) =>
        value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0),
    ) ||
      (data.salaryMin !== "" &&
        data.salaryMax !== "" &&
        Number(data.salaryMin) > Number(data.salaryMax)));
  const basicInvalid =
    invalid ||
    addressInvalid ||
    !data.title.trim() ||
    !data.category ||
    !jobTitles.some((item) => item.id === data.jobTitleId) ||
    !data.deadline ||
    new Date(data.deadline + "T23:59:59").getTime() <= Date.now() ||
    (data.experience !== "" &&
      (!Number.isInteger(Number(data.experience)) ||
        Number(data.experience) < 0 ||
        Number(data.experience) > 99));
  const descriptionInvalid =
    !data.description.trim() ||
    !data.requirements.trim() ||
    data.description.length > JOB_TEXT_LIMITS.description ||
    data.requirements.length > JOB_TEXT_LIMITS.requirements;
  const goToStep = (next: number) => {
    if (next > 0 && basicInvalid) {
      toast.error(
        "Vui lòng hoàn thành thông tin cơ bản, mức lương và hạn nhận hồ sơ hợp lệ.",
      );
      return;
    }
    if (next > 1 && descriptionInvalid) {
      toast.error("Vui lòng nhập mô tả và yêu cầu ứng viên.");
      return;
    }
    setStep(next);
  };
  const publish = async () => {
    if (publishLock.current) return;
    if (
      basicInvalid ||
      descriptionInvalid ||
      !data.benefits.trim() ||
      data.benefits.length > JOB_TEXT_LIMITS.benefits
    ) {
      toast.error("Vui lòng hoàn thành thông tin tin tuyển dụng.");
      return;
    }
    publishLock.current = true;
    setPublishing(true);
    try {
      await httpRequest.post("/job-post", {
        title: data.title.trim(),
        jobCategoryId: data.category,
        jobTitleId: data.jobTitleId,
        provinceId: data.provinceId,
        wardId: data.wardId,
        address: data.address.trim(),
        salaryMin: data.negotiable
          ? null
          : salaryValue(data.salaryMin, data.currency),
        salaryMax: data.negotiable
          ? null
          : salaryValue(data.salaryMax, data.currency),
        currency: data.currency === "USD/tháng" ? "USD" : "VND",
        saturdaySchedule: data.saturdaySchedule,
        experienceYearsMin:
          data.experience === "" ? null : Number(data.experience),
        deadlineAt: new Date(data.deadline + "T23:59:59").toISOString(),
        overview: {
          requirements: splitTags(data.overviewRequirements),
          specialties: splitTags(data.skills),
        },
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits,
      });
      toast.success("Đã gửi tin tuyển dụng, đang chờ duyệt.");
      setPreviewOpen(false);
      router.push("/employer");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.errors?.code === "JOB_LIMIT_REACHED") {
        toast.error(error.response.data.errors.message, {
          description: "Tạm dừng hoặc đóng một tin hiện có trước khi đăng thêm. Hãy lưu lại nội dung trước khi chuyển trang.",
          action: { label: "Quản lý tin", onClick: () => router.push("/employer?tab=jobs") },
          duration: 10000,
        });
        return;
      }
      toast.error(
        axios.isAxiosError(error)
          ? (error.response?.data?.errors?.message ?? error.response?.data?.message ??
              "Không thể đăng tin. Vui lòng thử lại.")
          : "Không thể đăng tin.",
      );
    } finally {
      publishLock.current = false;
      setPublishing(false);
    }
  };
  const labels = [
    "Thông tin cơ bản",
    "Mô tả & yêu cầu",
    "Quyền lợi & xem trước",
  ];
  return (
    <main className="route-employer-post-job min-h-screen bg-[#f4f6f8]">
      <EmployerHeader />
      <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 grid grid-cols-3 gap-1 rounded-2xl bg-white p-1.5 shadow-sm sm:mb-6 sm:gap-2 sm:p-2">
          {labels.map((x, i) => (
            <button
              key={x}
              onClick={() => goToStep(i)}
              className={`min-w-0 rounded-xl px-2 py-3 text-xs font-bold transition sm:p-3 sm:text-sm ${step === i ? "bg-emerald-50 text-[#008f40]" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <span className="sm:hidden">Bước {i + 1}</span>
              <span className="hidden sm:inline">
                {i + 1}. {x}
              </span>
            </button>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:p-7">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {labels[step]}
            </h1>
            {step === 0 && (
              <div className="mt-6 grid gap-5">
                <Field
                  label="Tiêu đề tin tuyển dụng"
                  value={data.title}
                  change={(v) => set("title", v)}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <AddressSelect
                    label="Ngành nghề"
                    value={data.category}
                    onChange={(category) =>
                      setData((current) => ({
                        ...current,
                        category,
                        jobTitleId: "",
                      }))
                    }
                    options={(categories.data?.data ?? []).map((item) => ({
                      id: item.id,
                      label: item.name,
                    }))}
                    loading={categories.isPending}
                    error={categories.isError}
                    retry={() => void categories.refetch()}
                  />
                  <AddressSelect
                    label="Chức danh"
                    value={data.jobTitleId}
                    onChange={(value) => set("jobTitleId", value)}
                    options={jobTitles.map((item) => ({
                      id: item.id,
                      label: item.name,
                    }))}
                    disabled={!data.category}
                    loading={categories.isPending}
                    error={categories.isError}
                    retry={() => void categories.refetch()}
                  />
                  <AddressSelect
                    label="Tỉnh/Thành phố"
                    value={data.provinceId}
                    onChange={(provinceId) =>
                      setData((current) => ({
                        ...current,
                        provinceId,
                        wardId: "",
                      }))
                    }
                    options={(provinces.data?.data ?? []).map((item) => ({
                      id: item.id,
                      label: item.name,
                    }))}
                    loading={provinces.isPending}
                    error={provinces.isError}
                    retry={() => void provinces.refetch()}
                  />
                  <AddressSelect
                    label="Phường/Xã"
                    value={data.wardId}
                    onChange={(value) => set("wardId", value)}
                    options={(wards.data ?? []).map((item) => ({
                      id: item.id,
                      label: item.fullName,
                    }))}
                    disabled={!data.provinceId}
                    loading={!!data.provinceId && wards.isPending}
                    error={wards.isError}
                    retry={() => void wards.refetch()}
                  />
                  <Field
                    label="Địa chỉ cụ thể (số nhà, đường)"
                    value={data.address}
                    change={(value) => set("address", value)}
                  />
                  <Field
                    label="Lương tối thiểu"
                    value={data.salaryMin}
                    type="number"
                    change={(v) => changeSalary("salaryMin", v)}
                  />
                  <Field
                    label="Lương tối đa"
                    value={data.salaryMax}
                    type="number"
                    change={(v) => changeSalary("salaryMax", v)}
                  />
                  <label className="font-bold">
                    Đơn vị
                    <select
                      value={data.currency}
                      onChange={(e) => set("currency", e.target.value)}
                      className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"
                    >
                      <option>triệu VNĐ/tháng</option>
                      <option>VNĐ/tháng</option>
                      <option>USD/tháng</option>
                    </select>
                  </label>
                  <div className="font-bold">
                    <p className="mb-2">Lịch làm thứ Bảy</p>
                    <Select
                      value={data.saturdaySchedule === "WORK" ? "Làm thứ 7"
                        : (data.saturdaySchedule === "OFF" ? "Nghỉ thứ 7" : "Không đề cập")
                      }
                      onValueChange={(value) => {
                        if (
                          value === "WORK" ||
                          value === "OFF" ||
                          value === "UNSPECIFIED"
                        )
                          set("saturdaySchedule", value);
                      }}
                    >
                      <SelectTrigger
                        aria-label="Lịch làm thứ Bảy"
                        className="w-full data-[size=default]:h-12 rounded-xl bg-white px-3 font-normal"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectItem value="WORK">Làm thứ 7</SelectItem>
                        <SelectItem value="OFF">Nghỉ thứ 7</SelectItem>
                        <SelectItem value="UNSPECIFIED">
                          Không đề cập
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field
                    label="Kinh nghiệm tối thiểu"
                    type="number"
                    value={data.experience}
                    change={(v) => {
                      if (v === "" || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 99)) set("experience", v);
                    }}
                  />
                  <div>
                    <p className="mb-2 font-bold">Hạn nhận hồ sơ</p>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger
                        type="button"
                        className="flex h-12 w-full items-center gap-2 rounded-xl border px-3 text-left"
                      >
                        <CalendarDays className="size-5 text-slate-400" />
                        {data.deadline
                          ? new Date(
                              data.deadline + "T00:00:00",
                            ).toLocaleDateString("vi-VN")
                          : "Chọn ngày"}
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          locale={vi}
                          selected={
                            data.deadline
                              ? new Date(data.deadline + "T00:00:00")
                              : undefined
                          }
                          disabled={{
                            before: new Date(new Date().setHours(0, 0, 0, 0)),
                          }}
                          onSelect={(date) => {
                            if (date) {
                              set(
                                "deadline",
                                [
                                  date.getFullYear(),
                                  String(date.getMonth() + 1).padStart(2, "0"),
                                  String(date.getDate()).padStart(2, "0"),
                                ].join("-"),
                              );
                              setCalendarOpen(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <label className="flex gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={data.negotiable}
                    onChange={(e) => {
                      if (e.target.checked)
                        setData((current) => ({
                          ...current,
                          salaryMin: "",
                          salaryMax: "",
                          negotiable: true,
                        }));
                    }}
                  />
                  Mức lương thỏa thuận
                </label>
                {invalid && (
                  <p className="text-sm text-red-600">
                    Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu.
                  </p>
                )}
              </div>
            )}
            {step === 1 && (
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                  <h2 className="border-l-4 border-[#00b14f] pl-3 text-lg font-bold">
                    Tổng quan
                  </h2>
                  <div className="mt-4 grid gap-4">
                    <Field
                      label="Yêu cầu tổng quan"
                      value={data.overviewRequirements}
                      change={(v) => set("overviewRequirements", v)}
                    />
                    <Field
                      label="Chuyên môn"
                      value={data.skills}
                      change={(v) => set("skills", v)}
                    />
                  </div>
                </div>
                <ContentEditor
                  label="Mô tả công việc"
                  value={data.description}
                  change={(v) => set("description", v)}
                  job={data}
                />
                <ContentEditor
                  label="Yêu cầu ứng viên"
                  value={data.requirements}
                  change={(v) => set("requirements", v)}
                  job={data}
                />
              </div>
            )}
            {step === 2 && (
              <div className="mt-6">
                <ContentEditor
                  label="Quyền lợi ứng viên"
                  value={data.benefits}
                  change={(v) => set("benefits", v)}
                  job={data}
                />
              </div>
            )}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
              <button
                disabled={!step}
                onClick={() => setStep(step - 1)}
                className="rounded-xl border px-5 py-3 font-bold disabled:opacity-30"
              >
                Quay lại
              </button>
              <button
                disabled={
                  basicInvalid ||
                  (step >= 1 && descriptionInvalid) ||
                  (step === 2 && !data.benefits.trim())
                }
                onClick={() =>
                  step === 2 ? setPreviewOpen(true) : goToStep(step + 1)
                }
                className="rounded-xl bg-[#00b14f] px-5 py-3 font-bold text-white disabled:opacity-30"
              >
                {step === 2 ? "Xem trước tin đăng" : "Tiếp tục"}
              </button>
            </div>
          </section>
          <Preview data={previewData} />
        </div>
      </div>
      {previewOpen && (
        <FullPreview
          data={previewData}
          onClose={() => setPreviewOpen(false)}
          onPublish={publish}
          publishing={publishing}
        />
      )}
      <RoleFooter variant="employer" />
    </main>
  );
}
function Field({
  label,
  value,
  change,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  change: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="font-bold">
      {label}
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        disabled={disabled}
        value={value}
        onChange={(e) => change(e.target.value)}
        className="mt-2 w-full rounded-xl border p-3 font-normal disabled:bg-slate-100"
      />
    </label>
  );
}
function ContentEditor({
  label,
  value,
  change,
  job,
}: {
  label: string;
  value: string;
  change: (v: string) => void;
  job: Data;
}) {
  const maxLength =
    label === "Mô tả công việc"
      ? JOB_TEXT_LIMITS.description
      : label === "Yêu cầu ứng viên"
        ? JOB_TEXT_LIMITS.requirements
        : JOB_TEXT_LIMITS.benefits;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const generate = async () => {
    if (pending.current || !value.trim()) return;
    pending.current = true;
    setLoading(true);
    setError("");
    try {
      const task =
        label === "Mô tả công việc"
          ? "job_description"
          : label === "Yêu cầu ứng viên"
            ? "job_requirements"
            : "job_benefits";
      const response = await aiService.generateTextAI(task, {
        currentText: value,
        jobTitle: job.title,
        skills: job.skills,
        overviewRequirements: job.overviewRequirements,
        ...(job.experience !== "" ? { experienceYearsMin: Number(job.experience) } : {}),
        jobDescription: job.description,
        candidateRequirements: job.requirements,
      });
      if (
        !response.success ||
        typeof response.data !== "string" ||
        !response.data.trim()
      ) {
        throw new Error(
          response.message || "AI chưa trả về nội dung. Vui lòng thử lại.",
        );
      }
      change(response.data.trim());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể cải thiện nội dung. Vui lòng thử lại.",
      );
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };
  return (
    <section className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{label}</h2>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !value.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#00b14f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#009b45] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {loading ? "Đang viết..." : label === "Quyền lợi" ? "Cải thiện văn phong với AI" : "Viết chi tiết với AI"}
        </button>
      </div>
      <textarea
        aria-label={label}
        maxLength={maxLength}
        rows={10}
        value={value}
        readOnly={loading}
        onChange={(e) => change(e.target.value)}
        className="mt-4 w-full rounded-xl border p-4 font-normal leading-7"
      />
      <p className="mt-2 text-xs text-slate-500">
        {value.length.toLocaleString("vi-VN")}/
        {maxLength.toLocaleString("vi-VN")} ký tự
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}

function Preview({ data }: { data: Data & { location: string } }) {
  return (
    <aside className="h-fit min-w-0 rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
      <b>Xem trước tin đăng</b>
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5">
        <h2 className="break-words text-lg font-bold sm:text-xl">
          {data.title}
        </h2>
        <p className="mt-2 text-sm text-slate-500">Thông tin nhà tuyển dụng</p>
        <p className="mt-4 text-lg font-extrabold text-[#00a64f] sm:text-xl">
          {money(data)}
        </p>
        <div className="mt-4 space-y-3 border-y py-4 text-sm">
          <p className="flex gap-2">
            <MapPin className="size-5 shrink-0 text-green-500" />
            {data.location}
          </p>
          <p className="flex gap-2">
            <UsersRound className="size-5 shrink-0 text-green-500" />
            {data.experience === "" ? "Chưa cập nhật kinh nghiệm" : Number(data.experience) === 0 ? "Không yêu cầu kinh nghiệm" : `${data.experience} năm kinh nghiệm`}
          </p>
          <p className="flex gap-2">
            <CalendarDays className="size-5 shrink-0 text-green-500" />
            Hạn: {data.deadline}
          </p>
        </div>
      </div>
    </aside>
  );
}
function FullPreview({
  data,
  onClose,
  onPublish,
  publishing,
}: {
  data: Data & { location: string };
  onClose: () => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f4f6f8]">
      <header className="sticky top-0 z-10 border-b bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold text-slate-700"
          >
            <ArrowLeft className="size-4" />
            Quay lại chỉnh sửa
          </button>
          <div className="hidden text-center sm:block">
            <b>Xem trước tin tuyển dụng</b>
            <p className="text-xs text-slate-500">
              Kiểm tra toàn bộ nội dung trước khi đăng
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng xem trước"
            className="grid size-10 place-items-center rounded-full hover:bg-slate-100 sm:hidden"
          >
            <X className="size-5" />
          </button>
          <button
            disabled={publishing}
            onClick={onPublish}
            className="rounded-xl bg-[#00b14f] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#009f47]"
          >
            {publishing ? "Đang gửi..." : "Đăng tin tuyển dụng"}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <b>Đây là giao diện ứng viên sẽ nhìn thấy.</b> Hãy rà soát tiêu đề,
          mức lương, yêu cầu và quyền lợi trước khi đăng.
        </div>
        <Hero data={data} />
        <Overview data={data} />
        <Section title="Mô tả công việc" content={data.description} />
        <Section title="Yêu cầu ứng viên" content={data.requirements} />
        <Section title="Quyền lợi ứng viên" content={data.benefits} />
        <div className="flex flex-col-reverse justify-end gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row">
          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 font-bold text-slate-700"
          >
            Tiếp tục chỉnh sửa
          </button>
          <button
            disabled={publishing}
            onClick={onPublish}
            className="rounded-xl bg-[#00b14f] px-6 py-3 font-bold text-white"
          >
            {publishing ? "Đang gửi..." : "Đăng tin tuyển dụng"}
          </button>
        </div>
      </main>
    </div>
  );
}
function Hero({ data }: { data: Data }) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <p className="mt-3 text-slate-500">Nhà tuyển dụng</p>
      <p className="mt-4 text-2xl font-bold text-[#00a64f]">{money(data)}</p>
    </section>
  );
}
function Overview({ data }: { data: Data }) {
  const specialties = data.skills
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
    requirements = data.overviewRequirements
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="border-l-4 border-[#00b14f] pl-4 text-2xl font-bold">
        Tổng quan
      </h2>
      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-[120px_1fr]">
        <b>Yêu cầu:</b>
        <div className="flex flex-wrap gap-2">
          {data.experience !== "" && (
            <Tag>{Number(data.experience) === 0 ? "Không yêu cầu kinh nghiệm" : `${data.experience} năm kinh nghiệm`}</Tag>
          )}
          {requirements.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
        <b>Chuyên môn:</b>
        <div className="flex flex-wrap gap-2">
          {specialties.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
      </div>
    </section>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700">
      {children}
    </span>
  );
}
function Section({ title, content }: { title: string; content: string }) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="border-l-4 border-green-500 pl-4 text-2xl font-bold">
        {title}
      </h2>
      <div className="mt-6 space-y-3 text-slate-700">
        {content.split("\n").map((line, i) => {
          const text = line.trim();
          if (!text) return <div key={i} className="h-2" />;
          if (/^[-*•]\s*/.test(text))
            return (
              <div key={i} className="flex gap-3 pl-2 leading-7">
                <span className="font-bold">•</span>
                <span>{text.replace(/^[-*•]\s*/, "")}</span>
              </div>
            );
          return (
            <p key={i} className="leading-7">
              {text}
            </p>
          );
        })}
      </div>
    </section>
  );
}

function AddressSelect({
  label,
  value,
  onChange,
  options,
  loading,
  error,
  retry,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  loading: boolean;
  error: boolean;
  retry: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 font-bold">{label}</p>
      <Select
        value={value || null}
        onValueChange={(next) => next && onChange(next)}
        modal={false}
        disabled={disabled || loading}
      >
        <SelectTrigger
          aria-label={label}
          className="w-full data-[size=default]:h-12 rounded-xl bg-white px-3"
        >
          <SelectValue>
            {options.find((item) => item.id === value)?.label ??
              (loading ? "Đang tải..." : "Chọn " + label.toLowerCase())}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="max-h-72">
          {options.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
          {!options.length && (
            <p className="p-3 text-sm text-slate-500">Chưa có dữ liệu.</p>
          )}
        </SelectContent>
      </Select>
      {error && (
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-sm text-red-600"
        >
          Không tải được dữ liệu. Thử lại
        </button>
      )}
    </div>
  );
}
