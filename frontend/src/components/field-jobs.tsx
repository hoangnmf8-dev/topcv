"use client";
import { JobCard } from "@/components/job-card";
import { toJobCard } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { jobCategoryKey, jobPostListFilterKey, provinceKey } from "@/cache-key";
import jobCategoryService from "@/services/job-category.service";
import locationService from "@/services/location.service";
import type { JobCategory } from "@/types";
import {
  LocationFilter,
  SalaryFilter,
  emptySalary,
  type LocationSelection,
  type SalarySelection,
} from "@/components/field-job-filters";
import jobPostService from "@/services/job-post.service";

type SaturdayFilter = "WORK" | "OFF" | "UNSPECIFIED" | null;
const saturdayOptions: { value: SaturdayFilter; label: string }[] = [
  { value: null, label: "Tất cả" },
  { value: "WORK", label: "Làm thứ 7" },
  { value: "OFF", label: "Nghỉ thứ 7" },
  { value: "UNSPECIFIED", label: "Tin đăng không đề cập" },
];
type FieldJob = {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  experience: string;
  category: string;
  mode: string;
  age: number;
};
const jobs: FieldJob[] = [];

export function FieldJobsInteractive() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-slate-500">Đang tải bộ lọc...</p>
      }
    >
      <FieldJobsFromSearch />
    </Suspense>
  );
}

function FieldJobsFromSearch() {
  const params = useSearchParams();
  const locationParam = (params.get("location") ?? "").trim();
  const hasLocation = !!locationParam && locationParam !== "all";
  const provinces = useQuery({
    queryKey: provinceKey,
    queryFn: ({ signal }) => locationService.getProvince(signal),
    enabled: hasLocation,
    staleTime: 5 * 60 * 1000,
  });
  const {
    data: jobCategories,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: jobCategoryKey,
    queryFn: ({ signal }) => jobCategoryService.getJobCategory(signal),
    staleTime: 5 * 60 * 1000,
  });
  if (isPending)
    return (
      <p role="status" className="p-6 text-sm text-slate-500">
        Đang tải danh sách ngành nghề...
      </p>
    );
  if (isError && !jobCategories?.data)
    return (
      <div role="alert" className="p-6 text-sm text-slate-600">
        <p>Không thể tải danh sách ngành nghề.</p>
        <button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="mt-3 font-semibold text-emerald-700 disabled:opacity-50"
        >
          {isFetching ? "Đang tải..." : "Thử lại"}
        </button>
      </div>
    );
  const categoryParam = params.get("category") ?? "";
  const selectedCategory = jobCategories.data.find(
    (item) =>
      item.id === categoryParam ||
      item.code === categoryParam ||
      item.name === categoryParam,
  );
  const category =
    selectedCategory?.name ??
    (categoryParam && categoryParam !== "all"
      ? categoryParam
      : "Tất cả ngành nghề");
  const query = params.get("q") ?? "";
  if (hasLocation && provinces.isPending)
    return (
      <p role="status" className="p-6 text-sm text-slate-500">
        Đang tải địa điểm từ tìm kiếm...
      </p>
    );
  if (hasLocation && provinces.isError && !provinces.data)
    return (
      <div role="alert" className="p-6 text-sm text-slate-600">
        <p>Không thể tải địa điểm từ tìm kiếm.</p>
        <button
          type="button"
          disabled={provinces.isFetching}
          onClick={() => void provinces.refetch()}
          className="mt-3 font-semibold text-emerald-700"
        >
          Thử lại
        </button>
      </div>
    );
  const selectedProvince = hasLocation
    ? provinces.data?.data.find(
        (item) =>
          item.id === locationParam ||
          item.code === locationParam ||
          item.name.toLocaleLowerCase("vi") ===
            locationParam.toLocaleLowerCase("vi") ||
          item.fullName.toLocaleLowerCase("vi") ===
            locationParam.toLocaleLowerCase("vi"),
      )
    : undefined;
  const initialLocations: LocationSelection[] = selectedProvince
    ? [
        {
          provinceId: selectedProvince.id,
          name: selectedProvince.name,
          wardIds: [],
        },
      ]
    : [];
  const location = selectedProvince?.name ?? "Tất cả địa điểm";
  return (
    <FieldJobsContent
      key={params.toString()}
      jobCategories={jobCategories.data}
      initialSearch={{ query, category, location }}
      initialLocations={initialLocations}
      initialSpecialties={
        selectedCategory
          ? [
              selectedCategory.id,
              ...(selectedCategory.jobTitles ?? []).map((title) => title.id),
            ]
          : []
      }
    />
  );
}

function FieldJobsContent({
  initialLocations,
  jobCategories,
  initialSearch,
  initialSpecialties,
}: {
  initialSearch: { query: string; category: string; location: string };
  initialSpecialties: string[];
  initialLocations: LocationSelection[];
  jobCategories: JobCategory[];
}) {
  const router = useRouter();
  const categories = [
    "Tất cả ngành nghề",
    ...jobCategories.map((category) => category.name),
  ];
  const initial = {
    query: "",
    category: "Tất cả ngành nghề",
    location: "Tất cả địa điểm",
  };
  const emptyFilters = {
    locations: [] as LocationSelection[],
    salary: emptySalary,
  };
  const [draft, setDraft] = useState({
      ...initialSearch,
      ...emptyFilters,
      locations: initialLocations,
    }),
    [experience, setExperience] = useState("Tất cả"),
    [mode, setMode] = useState("Tất cả"),
    [sort, setSort] = useState("newest"),
    [saved, setSaved] = useState<string[]>([]),
    [saturdaySchedule, setSaturdaySchedule] = useState<SaturdayFilter>(null),
    [specialties, setSpecialties] = useState<string[]>(initialSpecialties),
    [page, setPage] = useState(1);
  const [salaryReset, setSalaryReset] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearch.query.trim());
  const [searchLocations, setSearchLocations] = useState(initialLocations);
  const filters = {
    query: searchQuery,
    provinceIds: [...new Set(searchLocations.map((item) => item.provinceId))],
    wardIds: [...new Set(searchLocations.flatMap((item) => item.wardIds))],
    saturdaySchedule,
    salary: { min: draft.salary.min, max: draft.salary.max },
    jobTitleIds: [
      ...new Set(
        jobCategories.flatMap((category) =>
          (category.jobTitles ?? [])
            .filter((title) => specialties.includes(title.id))
            .map((title) => title.id),
        ),
      ),
    ],
    experienceYearsMin:
      experience === "Tất cả"
        ? null
        : experience === "Không yêu cầu"
          ? 0
          : Number(experience.match(/\d+/)?.[0] ?? 5),
    employmentType:
      (
        {
          "Full-time": "full_time",
          Remote: "remote",
          Hybrid: "hybrid",
        } as Record<string, string | undefined>
      )[mode] ?? null,
  };
  const clear = () => {
    setDraft({ ...initial, ...emptyFilters });
    setSearchQuery("");
    setSearchLocations([]);
    setSalaryReset((value) => value + 1);
    setExperience("Tất cả");
    setMode("Tất cả");
    setSaturdaySchedule(null);
    setSpecialties([]);
    setSort("newest");
    setPage(1);
  };
  const submitSearch = () => {
    const nextQuery = draft.query.trim();
    const sameLocations =
      JSON.stringify(draft.locations) === JSON.stringify(searchLocations);
    if (nextQuery === searchQuery && sameLocations && page === 1)
      void refetch();
    setSearchQuery(nextQuery);
    setSearchLocations(draft.locations);
    setPage(1);
  };
  const params = {
    ...filters,
    page,
    limit: 8,
    sort: sort as "newest" | "salary" | "hot",
  };
  const {
    data: jobPostList,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: jobPostListFilterKey(params, page),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => jobPostService.getJobPostList(params, signal),
  });
  const visibleJobs = (jobPostList ?? []).map(toJobCard);
  return (
    <>
      <section className="bg-[#087b43] py-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
          className="mx-auto grid max-w-280 gap-2 px-4 md:grid-cols-[1fr_230px_auto]"
        >
          <label className="flex h-13 items-center rounded-xl bg-white px-4">
            <Search className="size-5 text-slate-400" />
            <input
              value={draft.query}
              onChange={(e) =>
                setDraft((v) => ({ ...v, query: e.target.value }))
              }
              className="h-full w-full px-3 text-sm outline-none"
              placeholder="Chức danh, kỹ năng hoặc công ty"
            />
          </label>
          <LocationFilter
            value={draft.locations}
            onChange={(locations) => {
              setDraft((current) => ({
                ...current,
                locations,
                location: locations.length
                  ? locations.map((item) => item.name).join(", ")
                  : "Tất cả địa điểm",
              }));
            }}
          />
          <button className="h-13 rounded-xl bg-[#00c65e] px-7 text-sm font-bold text-white hover:bg-[#00b14f]">
            Tìm kiếm
          </button>
        </form>
      </section>
      <section className="mx-auto max-w-280 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">
              Tuyển dụng{" "}
              <b className="text-emerald-600">
                {visibleJobs.length} việc làm{" "}
                {draft.category !== "Tất cả ngành nghề"
                  ? draft.category
                  : "mới nhất"}
              </b>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Trang chủ › Việc làm › {draft.category}
            </p>
          </div>
          <button
            onClick={() =>
              toast.info("Tính năng thông báo việc làm hiện chưa khả dụng.")
            }
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-sm font-bold shadow-sm"
          >
            <Bell className="size-4 text-amber-500" />
            Tạo thông báo việc làm
          </button>
        </div>
        <div className="mt-7 grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm xl:sticky xl:top-24">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <SlidersHorizontal className="size-5 text-emerald-600" />
              Bộ lọc nâng cao
            </h2>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="mb-2 text-sm font-semibold">Lịch làm thứ 7</p>
              <FilterSelect
                label="Lịch làm thứ 7"
                value={
                  saturdayOptions.find(
                    (option) => option.value === saturdaySchedule,
                  )?.label ?? "Tất cả"
                }
                options={saturdayOptions.map((option) => option.label)}
                onChange={(label) => {
                  setPage(1);
                  setSaturdaySchedule(
                    saturdayOptions.find((option) => option.label === label)
                      ?.value ?? null,
                  );
                }}
              />
            </div>
            <SalaryFilter
              key={salaryReset}
              value={draft.salary}
              onChange={(salary) => {
                setPage(1);
                setDraft((current) => ({ ...current, salary }));
              }}
            />
            <CategoryCheckGroup
              categories={jobCategories}
              values={specialties}
              onChange={(values) => {
                setSpecialties(values);
                setPage(1);
              }}
            />{" "}
            <div className="mt-5 border-t pt-5">
              <p className="mb-2 text-sm font-semibold">Kinh nghiệm</p>
              <FilterSelect
                label="Kinh nghiệm"
                value={experience}
                onChange={(value) => {
                  setExperience(value);
                  setPage(1);
                }}
                options={[
                  "Tất cả",
                  "Không yêu cầu",
                  "1 năm",
                  "2 năm",
                  "3 năm",
                  "4 năm",
                  "Từ 5+ năm",
                ]}
              />
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="mb-2 text-sm font-semibold">Hình thức làm việc</p>
              <FilterSelect
                label="Hình thức làm việc"
                value={mode}
                onChange={(value) => {
                  setMode(value);
                  setPage(1);
                }}
                options={["Tất cả", "Full-time", "Remote", "Hybrid"]}
              />
            </div>
            <button
              onClick={clear}
              className="mt-2 w-full py-2 text-sm font-semibold text-slate-500"
            >
              Xóa bộ lọc
            </button>
          </aside>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <b>{visibleJobs.length} việc làm phù hợp</b>
              <Select
                modal={false}
                value={sort}
                onValueChange={(value) => {
                  if (value) {
                    setSort(value);
                    setPage(1);
                  }
                }}
              >
                <SelectTrigger
                  aria-label="Sắp xếp việc làm"
                  className="h-11 w-52 gap-2 rounded-xl border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300"
                >
                  <ArrowUpDown
                    aria-hidden="true"
                    className="size-4 shrink-0 text-slate-400"
                  />
                  <SelectValue className="flex-1 text-left">{sort}</SelectValue>
                </SelectTrigger>
                <SelectContent
                  align="end"
                  alignItemWithTrigger={false}
                  className="w-52 rounded-xl border-slate-200 bg-white p-1.5 shadow-lg"
                >
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="salary">Lương cao nhất</SelectItem>
                  <SelectItem value="hot">Tin HOT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div role="status" className="space-y-3">
                  <p className="text-sm text-slate-500">Đang tải việc làm...</p>
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="h-48 animate-pulse rounded-2xl border bg-slate-100"
                    />
                  ))}
                </div>
              ) : isError ? (
                <div
                  role="alert"
                  className="rounded-2xl border bg-white p-8 text-center"
                >
                  <p>Không thể tải danh sách việc làm.</p>
                  <button
                    type="button"
                    disabled={isFetching}
                    onClick={() => void refetch()}
                    className="mt-3 text-emerald-700"
                  >
                    Thử lại
                  </button>
                </div>
              ) : visibleJobs.length ? (
                <div
                  className={
                    "grid gap-4 transition-opacity duration-200 motion-reduce:transition-none " +
                    (isFetching ? "opacity-60" : "opacity-100")
                  }
                  aria-busy={isFetching}
                >
                  {visibleJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      saved={saved.includes(job.id)}
                      onSelect={() => router.push("/jobs/" + job.id)}
                      onToggleSave={() =>
                        toast.info("Lưu việc làm hiện chưa khả dụng.")
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
                  <Search className="mx-auto size-10 text-slate-300" />
                  <h2 className="mt-3 font-bold">
                    Không tìm thấy việc làm phù hợp
                  </h2>
                  <button
                    type="button"
                    onClick={clear}
                    className="mt-4 text-sm font-bold text-emerald-700"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
              {!isError &&
                !isLoading &&
                (visibleJobs.length > 0 || page > 1) && (
                  <nav
                    aria-label="Phân trang việc làm"
                    className="flex items-center justify-center gap-4 pt-5"
                  >
                    <button
                      type="button"
                      aria-label="Trang trước"
                      disabled={page <= 1 || isFetching}
                      onClick={() => {
                        setPage((current) => Math.max(1, current - 1));
                        window.scrollTo({
                          top: 0,
                          left: 0,
                          behavior: "smooth", // "smooth" giúp cuộn trượt mượt mà
                        });
                      }}
                      className="rounded-full border p-2 disabled:opacity-40"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <span className="text-sm">Trang {page}</span>
                    <button
                      type="button"
                      aria-label="Trang tiếp theo"
                      disabled={visibleJobs.length < 8 || isFetching}
                      onClick={() => {
                        setPage((current) => current + 1);
                        window.scrollTo({
                          top: 0,
                          left: 0,
                          behavior: "smooth", // "smooth" giúp cuộn trượt mượt mà
                        });
                      }}
                      className="rounded-full border p-2 disabled:opacity-40"
                    >
                      <ArrowRight className="size-4" />
                    </button>
                  </nav>
                )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <Select
      modal={false}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <SelectTrigger
        aria-label={label}
        className="w-full data-[size=default]:h-13 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-700"
      >
        {icon}
        <SelectValue>{value}</SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="max-h-80 rounded-xl p-2"
      >
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="rounded-lg py-2.5 data-selected:font-bold"
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function CategoryCheckGroup({
  categories,
  values,
  onChange,
}: {
  categories: JobCategory[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (category: JobCategory, titleId?: string) => {
    const titles = category.jobTitles ?? [];
    const next = new Set(values);
    if (titleId) {
      next.has(titleId) ? next.delete(titleId) : next.add(titleId);
      if (titles.every((title) => next.has(title.id))) next.add(category.id);
      else next.delete(category.id);
    } else {
      const selected = next.has(category.id);
      [category.id, ...titles.map((title) => title.id)].forEach((id) =>
        selected ? next.delete(id) : next.add(id),
      );
    }
    onChange([...next]);
  };
  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <fieldset className="min-w-0 w-full">
        <legend className="text-sm font-bold text-slate-800">
          Lọc theo danh mục nghề
        </legend>
        <div className="mt-3 max-h-96 space-y-3 overflow-y-auto">
          {categories.length === 0 && (
            <p className="text-sm text-slate-500">Chưa có ngành nghề.</p>
          )}
          {categories.map((category) => {
            const titles = category.jobTitles ?? [];
            const open = expanded.includes(category.id);
            const partial =
              !values.includes(category.id) &&
              titles.some((title) => values.includes(title.id));
            return (
              <div key={category.id}>
                <div className="flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={values.includes(category.id)}
                      ref={(node) => {
                        if (node) node.indeterminate = partial;
                      }}
                      onChange={() => toggle(category)}
                      className="size-4 shrink-0 accent-emerald-600"
                    />
                    <span>{category.name}</span>
                  </label>
                  {titles.length > 0 && (
                    <button
                      type="button"
                      aria-label={"Chức danh thuộc " + category.name}
                      aria-expanded={open}
                      aria-controls={"titles-" + category.id}
                      onClick={() =>
                        setExpanded((current) =>
                          open
                            ? current.filter((id) => id !== category.id)
                            : [...current, category.id],
                        )
                      }
                      className="rounded-md p-1 text-slate-500 hover:bg-emerald-50"
                    >
                      <ChevronDown
                        className={
                          open
                            ? "size-4 rotate-180 transition-transform"
                            : "size-4 transition-transform"
                        }
                      />
                    </button>
                  )}
                </div>
                {open && (
                  <div
                    id={"titles-" + category.id}
                    className="ml-6 mt-3 space-y-3 border-l border-slate-200 pl-3"
                  >
                    {titles.map((title) => (
                      <label
                        key={title.id}
                        className="flex cursor-pointer items-start gap-2 text-sm text-slate-600"
                      >
                        <input
                          type="checkbox"
                          checked={values.includes(title.id)}
                          onChange={() => toggle(category, title.id)}
                          className="mt-0.5 size-4 shrink-0 accent-emerald-600"
                        />
                        <span>{title.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
