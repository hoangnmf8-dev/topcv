"use client";

import { LoadingState } from "@/components/loading-state";
import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cvKeys } from "@/cache-key/cv.key";
import cvService from "@/services/cv.service";
import {
  cvFormSchema,
  cvImageSchema,
  type CvFormValues,
} from "@/validators/cv.validate";
import { useAccountStore } from "@/stores/auth.store";
import { Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ControlBar } from "@/components/cv/control-bar";
import { FormPanel } from "@/components/cv/form-panel";
import { PreviewPanel } from "@/components/cv/preview-panel";
import { CVDocument } from "@/components/cv/cv-document";
import { getCVSample } from "@/lib/cv-samples";
import { TEMPLATES, THEMES } from "@/lib/cv-layout";
import { useImagePreview } from "@/lib/hook";
import { cn } from "@/lib/utils";
import {
  EMPTY_CV,
  type CVData,
  type TemplateId,
  type ThemeId,
} from "@/lib/cv-layout";

function CVBuilderPage() {
  const searchParams = useSearchParams();
  const initialTemplate =
    TEMPLATES.find((item) => item.id === searchParams.get("template"))?.id ??
    "modern";
  const router = useRouter();
  const account = useAccountStore((s) => s.account);
  const accountId = account?.id ?? "";
  const client = useQueryClient();
  const id = searchParams.get("id") ?? "";
  const newId = useRef("");
  const loaded = useRef("");
  const pending = useRef(false);
  const file = useRef<File | null>(null);
  const uploaded = useRef<{ file: File; key: string } | null>(null);
  const [imageFile, setImageFile] = useState<File>();
  const form = useForm<CvFormValues>({
    resolver: zodResolver(cvFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "CV của bạn",
      templateCode: initialTemplate,
      theme:
        THEMES.find((t) => t.id === searchParams.get("theme"))?.id ?? "emerald",
      data:
        searchParams.get("sample") === "1"
          ? getCVSample(initialTemplate)
          : EMPTY_CV,
    },
  });
  const { data, title, templateCode: template, theme } = form.watch();
  const avatar = useImagePreview(imageFile, data.personal.avatar);
  const previewData = { ...data, personal: { ...data.personal, avatar } };
  const detail = useQuery({
    queryKey: cvKeys.detail(accountId, id),
    enabled: !!id && account?.role === "candidate",
    queryFn: ({ signal }) => cvService.detail(id, signal),
    refetchOnWindowFocus: false,
  });
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    if (!detail.data || loaded.current === id) return;
    const cv = detail.data;
    // Remove persisted presentation metadata before validating the form data.
    if (!cv.contentJson) {
      setLoadError(
        "CV PDF hoặc CV cũ này không có dữ liệu chỉnh sửa tương thích.",
      );
      return;
    }
    const { theme: ignoredTheme, ...content } = cv.contentJson;
    const values = {
      title: cv.title,
      templateCode: cv.templateCode,
      theme: ignoredTheme ?? "emerald",
      data: {
        ...content,
        personal: { ...content.personal, avatar: cv.avatarUrl },
      },
    };
    const valid = cvFormSchema.safeParse(values);
    if (!valid.success) {
      setLoadError(
        "CV này không có dữ liệu chỉnh sửa tương thích với trình tạo CV.",
      );
      return;
    }
    setLoadError("");
    form.reset(valid.data);
    loaded.current = id;
  }, [detail.data, id, form]);
  const [aiError, setAiError] = useState("");
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "default-saved"
  >("idle");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const handleOptimize = () => setAiError("Tính năng AI hiện chưa khả dụng.");
  function onAvatarChange(next: File | null) {
    if (next) {
      const valid = cvImageSchema.safeParse(next);
      if (!valid.success) {
        toast.error(valid.error.issues[0]?.message);
        return;
      }
    }
    file.current = next;
    uploaded.current = null;
    setImageFile(next ?? undefined);
    form.setValue("data.personal.avatar", "", {
      shouldDirty: true,
    });
    form.setValue("data.personal.avatarKey", "", { shouldDirty: true });
  }
  const persistCV = (isDefault: boolean) =>
    void form.handleSubmit(
      async (values) => {
        if (pending.current) return;
        if (account?.role !== "candidate") {
          toast.error("Vui lòng đăng nhập tài khoản ứng viên để lưu CV.");
          return;
        }
        pending.current = true;
        setSaveState("saving");
        try {
          let avatarKey = values.data.personal.avatarKey ?? "";
          if (file.current) {
            if (uploaded.current?.file !== file.current)
              uploaded.current = {
                file: file.current,
                key: await cvService.uploadImage(file.current),
              };
            avatarKey = uploaded.current.key;
          }
          const { avatar, ...personal } = values.data.personal;
          const payload = {
            title: values.title,
            templateCode: values.templateCode,
            contentJson: {
              ...values.data,
              personal: { ...personal, avatarKey },
              theme: values.theme,
            },
            ...(isDefault ? { isDefault: true } : {}),
          };
          if (!newId.current) newId.current = crypto.randomUUID();
          const saved = id
            ? await cvService.update(id, payload)
            : await cvService.create(newId.current, payload);
          form.setValue("data.personal.avatarKey", avatarKey);
          file.current = null;
          uploaded.current = null;
          await client.invalidateQueries({ queryKey: cvKeys.all(accountId) });
          await client.invalidateQueries({ queryKey: ["profile-completion", accountId] });
          await client.invalidateQueries({ queryKey: ["candidate-overview", accountId] });
          setSaveState(isDefault ? "default-saved" : "saved");
          toast.success("Đã lưu CV");
          if (!id) router.replace(`/cv-builder?id=${saved.id}`);
        } catch (error) {
          setSaveState("idle");
          toast.error(
            error instanceof Error
              ? error.message
              : "Không lưu được CV. Nội dung vẫn được giữ lại.",
          );
        } finally {
          pending.current = false;
        }
      },
      () => {
        setMobileView("edit");
        toast.error("Vui lòng kiểm tra các trường được báo lỗi.");
      },
    )();
  useEffect(() => {
    if (form.formState.isDirty && saveState !== "saving") setSaveState("idle");
  }, [data, title, template, theme]);
  const handleDownloadPDF = () => window.print();
  if (id && !account)
    return (
      <div className="p-8">
        Vui lòng{" "}
        <a className="text-emerald-700 underline" href="/login">
          đăng nhập
        </a>{" "}
        để mở CV.
      </div>
    );
  if (id && account?.role === "candidate" && detail.isPending)
    return <LoadingState fullscreen message="Đang tải CV…" />;
  if (id && (detail.isError || loadError || account?.role !== "candidate"))
    return (
      <div className="p-8 text-red-600">
        {loadError || "Không thể mở CV hoặc bạn không có quyền truy cập."}
        <button
          className="ml-3 underline"
          onClick={() => void detail.refetch()}
        >
          Thử lại
        </button>
      </div>
    );
  return (
    <FormProvider {...form}>
      <div className="route-cv-builder flex h-dvh flex-col overflow-hidden">
        <ControlBar
          title={title}
          onTitleChange={(value) =>
            form.setValue("title", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          template={template}
          onTemplateChange={(value) =>
            form.setValue("templateCode", value, { shouldDirty: true })
          }
          theme={theme}
          onThemeChange={(value) =>
            form.setValue("theme", value, { shouldDirty: true })
          }
          onOptimize={handleOptimize}
          onSave={() => persistCV(false)}
          onSaveAsDefault={() => persistCV(true)}
          onDownloadPDF={handleDownloadPDF}
          aiLoading={false}
          saveState={saveState}
        />

        {aiError && (
          <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-center text-xs font-medium text-destructive">
            {aiError}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1 border-b border-border bg-background p-1.5 lg:hidden">
          <TabButton
            active={mobileView === "edit"}
            onClick={() => setMobileView("edit")}
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </TabButton>
          <TabButton
            active={mobileView === "preview"}
            onClick={() => setMobileView("preview")}
          >
            <Eye className="h-4 w-4" />
            Xem trước
          </TabButton>
        </div>
        <main className="grid min-h-0 flex-1 lg:grid-cols-2">
          <div
            className={cn(
              "min-h-0 border-r border-border",
              mobileView === "edit" ? "block" : "hidden lg:block",
            )}
          >
            <fieldset
              disabled={saveState === "saving"}
              className="h-full min-w-0"
            >
              <FormPanel onAvatarChange={onAvatarChange} avatar={avatar} />
            </fieldset>
          </div>
          <div
            className={cn(
              "min-h-0",
              mobileView === "preview" ? "block" : "hidden lg:block",
            )}
          >
            <PreviewPanel data={previewData} template={template} theme={theme} />
          </div>
        </main>
        <div
          id="cv-print-document"
          className="cv-print-document"
          aria-hidden="true"
        >
          <CVDocument data={previewData} template={template} theme={theme} />
        </div>
      </div>
    </FormProvider>
  );
}

function BuilderRoute() {
  const params = useSearchParams();
  const account = useAccountStore((s) => s.account);
  return (
    <CVBuilderPage
      key={`${account?.id ?? "guest"}:${params.get("id") ?? "new"}`}
    />
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <LoadingState fullscreen message="Đang mở mẫu CV…" />
      }
    >
      <BuilderRoute />
    </Suspense>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
