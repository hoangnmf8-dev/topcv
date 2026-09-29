"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronDown, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import locationService from "@/services/location.service";
import { provinceKey } from "@/cache-key";

export type LocationSelection = {
  provinceId: string;
  name: string;
  wardIds: string[];
};
export type SalarySelection = { min: number | null; max: number | null };
export const emptySalary: SalarySelection = { min: null, max: null };
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

export function LocationFilter({
  value,
  onChange,
}: {
  value: LocationSelection[];
  onChange: (value: LocationSelection[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const draft = value;
  const [active, setActive] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const provinces = useQuery({
    queryKey: provinceKey,
    queryFn: ({ signal }) => locationService.getProvince(signal),
    staleTime: 300000,
  });
  const wards = useQuery({
    queryKey: ["wards", active],
    queryFn: ({ signal }) => locationService.getWards(active, signal),
    enabled: open && !!active,
    staleTime: 300000,
  });
  const selected = draft.find((item) => item.provinceId === active);
  const toggleProvince = (provinceId: string, name: string) =>
    onChange(
      value.some((item) => item.provinceId === provinceId)
        ? value.filter((item) => item.provinceId !== provinceId)
        : [...value, { provinceId, name, wardIds: [] }],
    );
  const toggleWard = (id: string) => {
    const province = provinces.data?.data.find((item) => item.id === active);
    if (!province || !wards.data) return;
    const ids = selected
      ? selected.wardIds.length
        ? selected.wardIds
        : wards.data.map((item) => item.id)
      : [];
    const next = ids.includes(id)
      ? ids.filter((item) => item !== id)
      : [...ids, id];
    onChange([
      ...value.filter((item) => item.provinceId !== active),
      ...(next.length
        ? [
            {
              provinceId: active,
              name: province.name,
              wardIds: next.length === wards.data.length ? [] : next,
            },
          ]
        : []),
    ]);
  };
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setProvinceSearch("");
          setWardSearch("");
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger
        type="button"
        className="flex h-13 w-full items-center gap-2 rounded-xl bg-white px-4 text-sm text-slate-700"
      >
        <MapPin className="size-4 shrink-0 text-slate-400" />
        <span className="flex-1 truncate text-left">
          {value.length
            ? value.map((item) => item.name).join(", ")
            : "Tất cả địa điểm"}
        </span>
        <ChevronDown className="size-4 shrink-0" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(640px,calc(100vw-24px))] gap-0 overflow-hidden rounded-2xl bg-white p-0"
      >
        <div className="border-b px-4 py-3 font-semibold text-emerald-700">
          Tỉnh/thành phố · Phường/xã
        </div>
        <div className="grid grid-cols-2 divide-x">
          <div className="min-w-0 p-3">
            <input
              aria-label="Tìm tỉnh thành"
              placeholder="Nhập Tỉnh/Thành phố"
              value={provinceSearch}
              onChange={(event) => setProvinceSearch(event.target.value)}
              className="mb-3 w-full border-b p-2 outline-emerald-500"
            />
            <div className="h-64 space-y-1 overflow-y-auto">
              {provinces.isPending && (
                <p role="status">Đang tải tỉnh/thành...</p>
              )}
              {provinces.isError && (
                <button type="button" onClick={() => void provinces.refetch()}>
                  Không tải được. Thử lại
                </button>
              )}
              {provinces.data?.data
                .filter((item) =>
                  normalize(item.name).includes(normalize(provinceSearch)),
                )
                .map((province) => {
                  const item = draft.find(
                    (entry) => entry.provinceId === province.id,
                  );
                  return (
                    <div
                      key={province.id}
                      className={
                        "flex items-center gap-2 rounded-lg p-2 " +
                        (active === province.id ? "bg-emerald-50" : "")
                      }
                    >
                      <input
                        type="checkbox"
                        aria-label={"Chọn " + province.name}
                        checked={!!item}
                        ref={(node) => {
                          if (node) node.indeterminate = !!item?.wardIds.length;
                        }}
                        onChange={() =>
                          toggleProvince(province.id, province.name)
                        }
                        className="size-4 shrink-0 accent-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActive(province.id);
                          setWardSearch("");
                        }}
                        className="flex min-w-0 flex-1 items-center justify-between gap-1 text-left"
                      >
                        <span>
                          {province.name}
                          {!!item?.wardIds.length && (
                            <small className="block text-slate-500">
                              {item.wardIds.length} phường/xã
                            </small>
                          )}
                        </span>
                        <ChevronRight className="size-4 shrink-0" />
                      </button>
                    </div>
                  );
                })}
              {provinces.isSuccess &&
                !provinces.data.data.some((item) =>
                  normalize(item.name).includes(normalize(provinceSearch)),
                ) && (
                  <p className="p-2 text-slate-500">
                    Không tìm thấy tỉnh/thành.
                  </p>
                )}
            </div>
          </div>
          <div className="min-w-0 p-3">
            <input
              aria-label="Tìm phường xã"
              placeholder="Nhập Phường/Xã"
              value={wardSearch}
              onChange={(event) => setWardSearch(event.target.value)}
              className="mb-3 w-full border-b p-2 outline-emerald-500"
            />
            <div className="h-64 space-y-1 overflow-y-auto">
              {!active && (
                <p className="p-2 text-slate-500">
                  Chọn tỉnh/thành để xem phường/xã.
                </p>
              )}
              {active && wards.isPending && (
                <p role="status">Đang tải phường/xã...</p>
              )}
              {wards.isError && (
                <button type="button" onClick={() => void wards.refetch()}>
                  Không tải được. Thử lại
                </button>
              )}
              {wards.data
                ?.filter((ward) =>
                  normalize(ward.fullName).includes(normalize(wardSearch)),
                )
                .map((ward) => (
                  <label
                    key={ward.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg p-2 hover:bg-emerald-50"
                  >
                    <input
                      type="checkbox"
                      checked={
                        !!selected &&
                        (!selected.wardIds.length ||
                          selected.wardIds.includes(ward.id))
                      }
                      onChange={() => toggleWard(ward.id)}
                      className="mt-0.5 size-4 shrink-0 accent-emerald-600"
                    />
                    {ward.fullName}
                  </label>
                ))}
              {active &&
                wards.isSuccess &&
                !wards.data.some((ward) =>
                  normalize(ward.fullName).includes(normalize(wardSearch)),
                ) && (
                  <p className="p-2 text-slate-500">
                    Không tìm thấy phường/xã.
                  </p>
                )}
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t p-3">
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-semibold text-emerald-600"
          >
            Bỏ chọn tất cả
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
            className="rounded-full bg-emerald-500 px-5 py-2 font-semibold text-white"
          >
            Xong
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const ranges = [
  { label: "Tất cả", kind: "all" },
  { label: "≤ 10 triệu", kind: "range", max: 10 },
  { label: "10 - 15 triệu", kind: "range", min: 10, max: 15 },
  { label: "15 - 20 triệu", kind: "range", min: 15, max: 20 },
  { label: "20 - 25 triệu", kind: "range", min: 20, max: 25 },
  { label: "25 - 30 triệu", kind: "range", min: 25, max: 30 },
  { label: "30 - 50 triệu", kind: "range", min: 30, max: 50 },
  { label: "Trên 50 triệu", kind: "range", min: 50 },
] as const;

export function SalaryFilter({
  value,
  onChange,
}: {
  value: SalarySelection;
  onChange: (value: SalarySelection) => void;
}) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    value.min === null && value.max === null ? "Tất cả" : null,
  );
  const [min, setMin] = useState(
    value.min === null ? "" : String(value.min / 1000000),
  );
  const [max, setMax] = useState(
    value.max === null ? "" : String(value.max / 1000000),
  );
  const invalid =
    (min !== "" && (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
    (max !== "" && (!Number.isFinite(Number(max)) || Number(max) < 0)) ||
    (min !== "" && max !== "" && Number(min) > Number(max));
  const edit = (low: string, high: string) => {
    setSelectedPreset(null);
    setMin(low);
    setMax(high);
  };
  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <fieldset className="min-w-0 w-full">
        <legend className="text-sm font-bold text-slate-700">Mức lương</legend>
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-3">
          {ranges.map((range) => {
            const low = "min" in range ? range.min * 1000000 : null;
            const high = "max" in range ? range.max * 1000000 : null;
            const checked = selectedPreset === range.label;
            return (
              <label
                key={range.label}
                className="flex min-w-0 cursor-pointer items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  className="size-4 shrink-0 accent-emerald-600"
                  onChange={() => {
                    const next = checked
                      ? emptySalary
                      : { min: low, max: high };
                    setSelectedPreset(checked ? "Tất cả" : range.label);
                    setMin(next.min === null ? "" : String(next.min / 1000000));
                    setMax(next.max === null ? "" : String(next.max / 1000000));
                  }}
                />
                {range.label}
              </label>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <input
            aria-label="Lương từ, triệu đồng"
            type="number"
            min="0"
            step="any"
            placeholder="Từ"
            value={min}
            onChange={(event) => edit(event.target.value, max)}
            className="w-0 min-w-0 flex-1 rounded-xl border px-3 py-2"
          />
          <span>-</span>
          <input
            aria-label="Lương đến, triệu đồng"
            type="number"
            min="0"
            step="any"
            placeholder="Đến"
            value={max}
            onChange={(event) => edit(min, event.target.value)}
            className="w-0 min-w-0 flex-1 rounded-xl border px-3 py-2"
          />
          <span>triệu</span>
        </div>
        <button
          type="button"
          disabled={invalid}
          onClick={() => {
            if (invalid) return;
            onChange({
              min: min === "" ? null : Number(min) * 1000000,
              max: max === "" ? null : Number(max) * 1000000,
            });
          }}
          className="mt-3 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Áp dụng
        </button>
        {invalid && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            Lương phải không âm và mức từ không vượt mức đến.
          </p>
        )}
      </fieldset>
    </div>
  );
}
