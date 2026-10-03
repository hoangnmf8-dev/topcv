import { formatJobSalary } from "@/lib/job-salary";
import type { Job } from "@/types";
import type { JobCardData } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { getAccesToken, makeRefreshToken } from "@/actions/auth.action";
import { Unauthorized } from "@/exceptions";
import { SyntheticEvent } from "react";
import uploadService from "@/services/upload.service";
import { useCompanyStore } from "@/stores/company.store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
let refreshPromise: null | Promise<boolean> = null;
export const httpRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3100",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
httpRequest.interceptors.request.use(async (config) => {
  const accessToken = await getAccesToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
httpRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.config &&
      !error.config._authRetried
    ) {
      error.config._authRetried = true;
      if (!refreshPromise) {
        refreshPromise = makeRefreshToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        return httpRequest(error.config);
      }
      throw new Unauthorized(
        "Đăng nhập để sử dụng tính năng này",
        "UNAUTHORIZED",
      );
    }
    return Promise.reject(error);
  },
);
export const refreshImage =
  (objectKey?: string | null) =>
  async (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (!objectKey) {
      image.src = "";
      return;
    }
    if (objectKey === image.dataset.objectKey) {
      image.src = "";
      return;
    }
    image.dataset.objectKey = objectKey;
    const result = await uploadService.getUrlFile(objectKey);
    image.src = result;
  };

export const formatAmount = (value: number | string, currency: string) =>
  new Intl.NumberFormat("vi-VN").format(Number(value)) + " " + currency;
export function toJobCard(item: Job): JobCardData {
  const currency = item.currency || "VND";
  const salary = formatJobSalary(item.salaryMin, item.salaryMax, currency);
  return {
    id: item.id,
    title: item.title,
    company: item.company?.name ?? "Chưa có thông tin công ty",
    logo: item.company?.logoUrl ?? "/placeholder.svg",
    salary,
    salaryMin: Number(item.salaryMin ?? 0) / 1000000,
    location: item.province?.name ?? "Chưa có thông tin địa điểm",
    district: item.ward?.fullName ?? "",
    address: [item.address, item.ward?.fullName, item.province?.name]
      .filter(Boolean)
      .join(", "),
    deadline: item.deadlineAt
      ? new Date(item.deadlineAt).toLocaleDateString("vi-VN")
      : "Chưa cập nhật",
    experience: String(item.experienceYearsMin ?? ""),
    jobType:
      (
        {
          full_time: "Full-time",
          part_time: "Part-time",
          hybrid: "Hybrid",
          remote: "Remote",
        } as Record<string, string>
      )[item.employmentType ?? ""] ?? "Chưa cập nhật",
    category: item.category?.name ?? "",
    tags: item.overview?.specialties ?? [],
    overviewRequirements: item.overview?.requirements ?? [],
    hot: item.isBoosted,
    updatedAt: item.createdAt,
    description: item.description ? [item.description] : [],
    requirements: item.requirements ? [item.requirements] : [],
    benefits: item.benefits ? [item.benefits] : [],
    company_info: {
      size: item.company?.sizeRange ?? "Chưa cập nhật thông tin",
      field: item.category?.name ?? "Chưa cập nhật thông tin",
      website: item.company?.website ?? "Chưa cập nhật thông tin",
      address: item.company?.address ?? "Chưa cập nhật thông tin",
      about: item.company?.description ?? "Chưa cập nhật thông tin",
    },
  };
}
