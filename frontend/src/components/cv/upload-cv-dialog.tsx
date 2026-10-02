"use client";
import { useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { UPLOAD } from "@/constants/upload.constant";
import { cvKeys } from "@/cache-key/cv.key";
import uploadService from "@/services/upload.service";
import { useAccountStore } from "@/stores/auth.store";
import { useCvAccess } from "@/hooks/use-cv-access";

export function UploadCvDialog() {
  const access = useCvAccess();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const uploaded = useRef<string | null>(null);
  const lock = useRef(false);
  const accountId = useAccountStore((state) => state.account?.id);
  const client = useQueryClient();
  function changeOpen(value: boolean) {
    if (lock.current) return;
    setOpen(value);
    if (!value) {
      setFile(null);
      setTitle("");
      setIsDefault(false);
      setError("");
      setProgress(0);
      uploaded.current = null;
    }
  }
  function selectFile(value: File | null) {
    uploaded.current = null;
    setProgress(0);
    setError("");
    setFile(null);
    if (!value) return;
    if (
      !/\.pdf$/i.test(value.name) ||
      (value.type && value.type !== "application/pdf")
    ) {
      setError("Vui lòng chọn file PDF.");
      return;
    }
    if (!value.size || value.size > UPLOAD.CV_SIZE) {
      setError("File PDF phải có dung lượng từ 1 byte đến 10 MB.");
      return;
    }
    setFile(
      value.type
        ? value
        : new File([value], value.name, { type: "application/pdf" }),
    );
    setTitle(value.name.replace(/\.pdf$/i, "").slice(0, 255));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !file || !accountId) return;
    if (!title.trim() || title.trim().length > 255) {
      setError("Tên CV phải có từ 1 đến 255 ký tự.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    let success = false;
    try {
      if (!uploaded.current) {
        const signature = await file.slice(0, 5).text();
        if (signature !== "%PDF-")
          throw new Error("Nội dung file không phải PDF.");
        const response = await uploadService.getPresignedUrl(file, "cv");
        await uploadService.uploadCvPdf(
          response.data.uploadUrl,
          file,
          setProgress,
        );
        uploaded.current = response.data.objectKey;
      }
      await uploadService.completeCv(
        uploaded.current!,
        title.trim(),
        isDefault,
      );
      success = true;
      toast.success("Đã tải CV PDF lên");
      await Promise.all([
        client.invalidateQueries({ queryKey: cvKeys.all(accountId) }),
        client.invalidateQueries({ queryKey: ["cv-access", accountId] }),
        client.invalidateQueries({
          queryKey: ["profile-completion", accountId],
        }),
        client.invalidateQueries({
          queryKey: ["candidate-overview", accountId],
        }),
      ]);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Không thể tải CV. Vui lòng thử lại.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      if (success) changeOpen(false);
    }
  }
  return (
    <>
      <Button
        type="button"
        className="h-10"
        variant="outline"
        disabled={!access.data?.canCreate}
        onClick={() => changeOpen(true)}
      >
        <Upload />
        Tải CV PDF lên
      </Button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tải CV PDF lên</DialogTitle>
            <DialogDescription>
              Chọn CV định dạng PDF, dung lượng tối đa 10 MB.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit}>
            <fieldset disabled={busy} className="space-y-4">
              <label className="block text-sm font-semibold">
                File CV
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="mt-2 block w-full rounded-lg border p-3 text-sm"
                  onChange={(event) =>
                    selectFile(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              {file && (
                <p className="text-xs text-slate-500">
                  {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
              <label className="block text-sm font-semibold">
                Tên CV
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={255}
                  className="mt-2 w-full rounded-lg border px-3 py-2"
                  required
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(event) => setIsDefault(event.target.checked)}
                />
                Đặt làm CV mặc định
              </label>
            </fieldset>
            {busy && (
              <div className="mt-4">
                <progress
                  value={progress}
                  max={100}
                  className="w-full"
                  aria-label="Tiến độ tải CV"
                />
                <p role="status" className="text-sm text-slate-500">
                  {progress === 100
                    ? "Đang xác nhận CV…"
                    : `Đang tải lên ${progress}%`}
                </p>
              </div>
            )}
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {error}
              </p>
            )}
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => changeOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={busy || !file || !title.trim()}>
                {busy ? <Loader2 className="animate-spin" /> : <Upload />}
                {busy ? "Đang tải…" : "Tải lên"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
