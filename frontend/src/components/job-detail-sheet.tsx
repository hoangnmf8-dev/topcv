"use client"

import Image from "next/image"
import {
  Send,
  Bookmark,
  BookmarkCheck,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  CheckCircle2,
  Building2,
  Globe,
  Users,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { JobCardData as Job } from "@/types"

type JobDetailSheetProps = {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
  saved: boolean
  onToggleSave: () => void
  onApply: () => void
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="text-foreground/90">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function JobDetailSheet({
  job,
  open,
  onOpenChange,
  saved,
  onToggleSave,
  onApply,
}: JobDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-xl"
        showCloseButton
      >
        {job && (
          <>
            <SheetHeader className="gap-3 border-b border-border p-5 pr-14">
              <div className="flex items-start gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                  <Image
                    src={job.logo || "/placeholder.svg"}
                    alt={`Logo ${job.company}`}
                    width={56}
                    height={56}
                    className="size-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-lg leading-snug text-balance">
                    {job.title}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {job.company}
                  </SheetDescription>
                </div>
              </div>

              {/* Key facts */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted p-2.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="size-3.5" /> Mức lương
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-primary">
                    {job.salary}
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-2.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> Địa điểm
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-sm font-semibold">
                    {job.location}
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-2.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="size-3.5" /> Kinh nghiệm
                  </div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {job.experience === "0" ? "Không YC" : `${job.experience}+ năm`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                Hạn nộp hồ sơ: {job.deadline}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={onApply} className="h-10 flex-1 gap-2">
                  <Send className="size-4" />
                  Ứng tuyển ngay
                </Button>
                <Button
                  variant="outline"
                  onClick={onToggleSave}
                  className="h-10 gap-2"
                >
                  {saved ? (
                    <BookmarkCheck className="size-4 text-primary" />
                  ) : (
                    <Bookmark className="size-4" />
                  )}
                  {saved ? "Đã lưu" : "Lưu tin"}
                </Button>
              </div>
            </SheetHeader>

            {/* Tabs */}
            <Tabs defaultValue="description" className="flex min-h-0 flex-1 flex-col gap-0">
              <div className="px-5 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="description">Mô tả công việc</TabsTrigger>
                  <TabsTrigger value="company">Thông tin công ty</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <TabsContent value="description" className="mt-0 flex flex-col gap-6 p-5">
                  <section>
                    <h4 className="mb-3 text-sm font-semibold">Mô tả công việc</h4>
                    <BulletList items={job.description} />
                  </section>
                  <Separator />
                  <section>
                    <h4 className="mb-3 text-sm font-semibold">Yêu cầu ứng viên</h4>
                    <BulletList items={job.requirements} />
                  </section>
                  <Separator />
                  <section>
                    <h4 className="mb-3 text-sm font-semibold">Quyền lợi</h4>
                    <BulletList items={job.benefits} />
                  </section>
                  <section>
                    <h4 className="mb-2.5 text-sm font-semibold">Kỹ năng</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="company" className="mt-0 flex flex-col gap-5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                      <Image
                        src={job.logo || "/placeholder.svg"}
                        alt={`Logo ${job.company}`}
                        width={64}
                        height={64}
                        className="size-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold">{job.company}</h4>
                      <p className="text-sm text-muted-foreground">
                        {job.company_info.field}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2.5 text-sm">
                      <Users className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Quy mô:</span>
                      <span className="font-medium">{job.company_info.size}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <Globe className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Website:</span>
                      <span className="font-medium text-primary">
                        {job.company_info.website}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">Địa chỉ:</span>
                      <span className="font-medium">{job.company_info.address}</span>
                    </div>
                  </div>

                  <section>
                    <h4 className="mb-2 text-sm font-semibold">Giới thiệu công ty</h4>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {job.company_info.about}
                    </p>
                  </section>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
