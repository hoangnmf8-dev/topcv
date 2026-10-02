"use client";
import { useEffect, useId, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import locationService from "@/services/location.service";
import { useCandidateStore } from "@/stores/candidate.store";
import { useAccountStore } from "@/stores/auth.store";
import type { Candidate, Provice } from "@/types";
import { provinceKey } from "@/cache-key";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useForm, useWatch } from "react-hook-form";
import {
  CandidateInput,
  candidateProfileSchema,
} from "@/validators/candidate.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "./ui/field";
import { useImagePreview } from "@/lib/hook";
import uploadService from "@/services/upload.service";
import candidateService from "@/services/candidate.service";

export function CandidateProfileForm() {
  const id = useId();
  const client = useQueryClient();
  const account = useAccountStore(state => state.account);
  const { candidate, setCandidate } = useCandidateStore((state) => state);
  const [avatarFile, setAvatarUrl] = useState<File>();
  const avatarUrl = useImagePreview(avatarFile, candidate?.avatarUrl ?? "");
  const {
    data: provinces,
    isFetching: provincesFetching,
    isError: provincesError,
    refetch,
  } = useQuery({
    queryKey: provinceKey,
    queryFn: ({ signal }) => locationService.getProvince(signal),
  });
  const { register, formState, control, handleSubmit, reset, clearErrors, } =
    useForm<CandidateInput>({
      resolver: zodResolver(candidateProfileSchema),
      mode: "onChange",
      defaultValues: {
        fullName: candidate?.fullName,
        phone: candidate?.phone ?? "",
        headline: candidate?.headline ?? "",
        experienceYears: candidate?.experienceYears ?? 0,
        address: candidate?.address ?? "",
        careerGoal: candidate?.careerGoal ?? "",
        isSearchable: candidate?.isSearchable,
      },
    });
  const input =
    "mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 " +
    "outline-none focus:border-emerald-500 focus:ring-2 " +
    "focus:ring-emerald-100";
  const careerGoal = useWatch({ control, name: "careerGoal" });
  async function onSubmit(values: CandidateInput) {
    const { avatar, ...newValue } = values;
    try {
      if (avatar && avatar instanceof File) {
        const avatarPresignedResponse = await uploadService.getPresignedUrl(
          avatar,
          "avatar",
        );
        if (avatarPresignedResponse.data.objectKey) {
          const avatarResponse = await uploadService.uploadFile(
            avatarPresignedResponse.data.uploadUrl,
            avatar,
          );
          if (avatarResponse) {
            const response = await uploadService.completeUploadFile(
              "avatar",
              avatarPresignedResponse.data.objectKey,
            );
          }
        }
      }
      const candidateReponse = await candidateService.updateCandidate(
        candidate?.id!,
        newValue,
      );
      if (candidateReponse.success) {
        await setCandidate(candidateReponse.data);
        useAccountStore.getState().updateCandidate(candidateReponse.data);
        await client.invalidateQueries({ queryKey: ["profile-completion", account?.id] });
        await client.invalidateQueries({ queryKey: ["candidate-overview", account?.id] });
        setAvatarUrl(undefined);
        toast.success(candidateReponse.message || "Lưu thông tin thành công");
        clearErrors("root.server");
        clearErrors(["avatar"]);
      } else {
        throw new Error(candidateReponse.message || "Không thể lưu thông tin.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể lưu thông tin công ty.",
      );
    }
  }
  useEffect(() => {
    if (!candidate) return;
    reset({
      fullName: candidate?.fullName,
      phone: candidate?.phone ?? "",
      headline: candidate?.headline ?? "",
      experienceYears: candidate?.experienceYears ?? 0,
      address: candidate?.address ?? "",
        careerGoal: candidate?.careerGoal ?? "",
      isSearchable: candidate?.isSearchable,
    });
  }, [candidate, reset]);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Chỉnh sửa hồ sơ ứng viên</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset
          disabled={formState.isSubmitting}
          className="mt-5 grid gap-5 sm:grid-rows-2 disabled:opacity-60"
        >
          <label
            className="relative block size-24 shrink-0 cursor-pointer rounded-full transition hover:opacity-80 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2"
            title="Đổi ảnh đại diện"
          >
            <Avatar className="size-24 border-4 border-emerald-50">
              <AvatarImage src={`${avatarUrl}`} alt={"Ảnh đại diện "} />
              <AvatarFallback className="bg-emerald-50 text-3xl font-bold text-emerald-700">
                AV
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              aria-label="Đổi ảnh đại diện"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              {...register("avatar", {
                onChange: (e) => setAvatarUrl(e.target.files?.[0]),
              })}
            />
          </label>
          <label htmlFor={`${id}-name`} className="text-sm font-semibold">
            Họ và tên
            <input
              id={`${id}-name`}
              className={input}
              {...register("fullName")}
            />
            {formState.errors.fullName?.message && (
              <FieldError id={`${id}-name-error`}>
                {formState.errors.fullName?.message}
              </FieldError>
            )}
          </label>
          <label htmlFor={`${id}-phone`} className="text-sm font-semibold">
            Số điện thoại
            <input
              id={`${id}-phone`}
              type="tel"
              {...register("phone")}
              className={input}
            />
            {formState.errors.phone?.message && (
              <FieldError id={`${id}-phone-error`}>
                {formState.errors.phone?.message}
              </FieldError>
            )}
          </label>
          <label htmlFor={`${id}-headline`} className="text-sm font-semibold">
            Tiêu đề nghề nghiệp
            <input
              id={`${id}-headline`}
              className={input}
              {...register("headline")}
            />
            {formState.errors.headline?.message && (
              <FieldError id={`${id}-headline-error`}>
                {formState.errors.headline?.message}
              </FieldError>
            )}
          </label>
          <label
            htmlFor={`${id}-experienceYears`}
            className="text-sm font-semibold"
          >
            Số năm kinh nghiệm
            <input
              id={`${id}-experienceYears`}
              type="number"
              min={0}
              max={80}
              step="1"
              className={input}
              {...register("experienceYears", {
                setValueAs: (value) =>
                  value === "" ? undefined : Number(value),
              })}
            />
            {formState.errors.experienceYears?.message && (
              <FieldError id={`${id}-experienceYears-error`}>
                {formState.errors.experienceYears?.message}
              </FieldError>
            )}
          </label>
          <label htmlFor={`${id}-address`} className="text-sm font-semibold">
            Địa điểm hiện tại
            <input
              id={`${id}-address`}
              type="text"
              className={input}
              {...register("address")}
            />
            {formState.errors.address?.message && (
              <FieldError id={`${id}-address-error`}>
                {formState.errors.address?.message}
              </FieldError>
            )}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isSearchable")} />
            Cho phép nhà tuyển dụng tìm thấy hồ sơ
          </label>
          <label
            htmlFor={`${id}-careerGoal`}
            className="text-sm font-semibold sm:col-span-2"
          >
            Mục tiêu nghề nghiệp
            <textarea
              id={`${id}-careerGoal`}
              rows={4}
              maxLength={2000}
              className={input}
              {...register("careerGoal")}
            />
            <span className="mt-1 block text-right text-xs text-slate-400">
              {careerGoal?.length ? careerGoal.length : 0}/300 ký tự
            </span>
            {formState.errors.careerGoal?.message && (
              <FieldError id={`${id}.careerGoal-error`}>
                {formState.errors.careerGoal?.message}
              </FieldError>
            )}
          </label>
          <div className="sm:col-span-2">
            <button className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">
              {formState.isSubmitting ? "Đang lưu..." : "Lưu hồ sơ"}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
