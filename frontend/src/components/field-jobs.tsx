"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Bell, BookOpen, BriefcaseBusiness, ChevronDown, Heart, MapPin, Search, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { JOB_CATEGORIES, JOB_CATEGORY_NAMES } from "@/lib/job-categories"

const categories = ["Tất cả ngành nghề", ...JOB_CATEGORY_NAMES]
const jobs = [
  {id:"1",title:"Nhân viên Kinh doanh/Tư vấn bán hàng",company:"Transcosmos Việt Nam",salary:"8 – 15 triệu",location:"Hà Nội",experience:"Không yêu cầu",category:"Kinh doanh / Bán hàng",mode:"Full-time",age:1},
  {id:"2",title:"Chuyên viên Phát triển khách hàng B2B",company:"Công ty Onenet",salary:"15 – 22 triệu",location:"Hà Nội",experience:"2 năm",category:"Kinh doanh / Bán hàng",mode:"Hybrid",age:2},
  {id:"3",title:"Frontend Developer ReactJS",company:"FPT Software",salary:"20 – 35 triệu",location:"Hà Nội",experience:"2 năm",category:"Công nghệ thông tin",mode:"Full-time",age:0},
  {id:"4",title:"Backend Developer Node.js",company:"VNG Corporation",salary:"25 – 40 triệu",location:"Hồ Chí Minh",experience:"2 năm",category:"Công nghệ thông tin",mode:"Remote",age:3},
  {id:"5",title:"Digital Marketing Executive",company:"Nova Media",salary:"12 – 20 triệu",location:"Hồ Chí Minh",experience:"1 năm",category:"Marketing / Truyền thông",mode:"Full-time",age:1},
  {id:"6",title:"Kế toán tổng hợp",company:"An Phát Holdings",salary:"14 – 18 triệu",location:"Đà Nẵng",experience:"2 năm",category:"Kế toán / Kiểm toán",mode:"Full-time",age:4},
  {id:"7",title:"UI/UX Designer",company:"MISA",salary:"18 – 30 triệu",location:"Hà Nội",experience:"1 năm",category:"Thiết kế / Sáng tạo",mode:"Hybrid",age:2},
]

export function FieldJobsInteractive(){
  const initial={query:"",category:"Tất cả ngành nghề",location:"Tất cả địa điểm"}
  const [draft,setDraft]=useState(initial),[filters,setFilters]=useState(initial),[experience,setExperience]=useState("Tất cả"),[mode,setMode]=useState("Tất cả"),[sort,setSort]=useState("Phù hợp nhất"),[saved,setSaved]=useState<string[]>([]),[categoryOpen,setCategoryOpen]=useState(false),[weekend,setWeekend]=useState<string[]>([]),[specialties,setSpecialties]=useState<string[]>([]),[page,setPage]=useState(0)
  const filtered=useMemo(()=>{const result=jobs.filter(job=>(job.title+job.company).toLowerCase().includes(filters.query.toLowerCase())&&(filters.category==="Tất cả ngành nghề"||job.category===filters.category)&&(filters.location==="Tất cả địa điểm"||job.location===filters.location)&&(experience==="Tất cả"||job.experience===experience)&&(mode==="Tất cả"||job.mode===mode));return [...result].sort((a,b)=>sort==="Mới nhất"?a.age-b.age:sort==="Lương cao nhất"?Number(b.salary.match(/\d+/)?.[0])-Number(a.salary.match(/\d+/)?.[0]):0)},[filters,experience,mode,sort])
  const jobsPerPage=4
  const totalPages=Math.max(1,Math.ceil(filtered.length/jobsPerPage))
  const visibleJobs=filtered.slice(page*jobsPerPage,(page+1)*jobsPerPage)
  useEffect(()=>setPage(0),[filters,experience,mode,sort])
  const submit=(event:FormEvent)=>{event.preventDefault();setFilters(draft);toast.success("Đã cập nhật kết quả tìm kiếm")}
  const clear=()=>{setDraft(initial);setFilters(initial);setExperience("Tất cả");setMode("Tất cả");setWeekend([]);setSpecialties([]);setPage(0)}
  const applyAdvancedFilters=()=>{setFilters(draft);setPage(0);toast.success("Đã áp dụng bộ lọc")}
  return <><section className="bg-[#087b43] py-5"><form onSubmit={submit} className="mx-auto grid max-w-[1120px] gap-2 px-4 md:grid-cols-[240px_1fr_230px_auto]">
    <div className="relative"><button type="button" onClick={()=>setCategoryOpen(v=>!v)} className="flex h-13 w-full items-center gap-2 rounded-xl bg-white px-4 text-left text-sm font-semibold text-slate-700"><BookOpen className="size-4 text-emerald-600"/><span className="truncate">{draft.category}</span><ChevronDown className={`ml-auto size-4 transition ${categoryOpen?"rotate-180":""}`}/></button>{categoryOpen&&<div className="absolute left-0 top-14 z-20 w-full rounded-xl border bg-white p-2 shadow-xl">{categories.map(category=><button type="button" key={category} onClick={()=>{setDraft(v=>({...v,category}));setCategoryOpen(false)}} className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm ${draft.category===category?"bg-emerald-50 font-bold text-emerald-700":"hover:bg-slate-50"}`}>{category}</button>)}</div>}</div>
    <label className="flex h-13 items-center rounded-xl bg-white px-4"><Search className="size-5 text-slate-400"/><input value={draft.query} onChange={e=>setDraft(v=>({...v,query:e.target.value}))} className="h-full w-full px-3 text-sm outline-none" placeholder="Chức danh, kỹ năng hoặc công ty"/></label>
    <label className="flex h-13 items-center rounded-xl bg-white px-3"><MapPin className="size-4 text-slate-400"/><select value={draft.location} onChange={e=>setDraft(v=>({...v,location:e.target.value}))} className="h-full w-full bg-transparent px-2 text-sm outline-none"><option>Tất cả địa điểm</option><option>Hà Nội</option><option>Hồ Chí Minh</option><option>Đà Nẵng</option></select></label><button className="h-13 rounded-xl bg-[#00c65e] px-7 text-sm font-bold text-white hover:bg-[#00b14f]">Tìm kiếm</button>
  </form></section><section className="mx-auto max-w-[1120px] px-4 py-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm">Tuyển dụng <b className="text-emerald-600">{filtered.length} việc làm {filters.category!=="Tất cả ngành nghề"?filters.category:"mới nhất"}</b></p><p className="mt-1 text-xs text-slate-500">Trang chủ › Việc làm › {filters.category}</p></div><button onClick={()=>toast.success("Đã tạo thông báo việc làm",{description:`Bạn sẽ nhận thông báo cho ${filters.query||filters.category.toLowerCase()}.`})} className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-sm font-bold shadow-sm"><Bell className="size-4 text-amber-500"/>Tạo thông báo việc làm</button></div>
  <div className="mt-7 grid gap-6 xl:grid-cols-[280px_1fr]"><aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm xl:sticky xl:top-24"><h2 className="flex items-center gap-2 text-lg font-bold"><SlidersHorizontal className="size-5 text-emerald-600"/>Bộ lọc nâng cao</h2><CheckGroup title="Nghỉ thứ 7" values={weekend} onChange={setWeekend} options={["Không lọc","Làm thứ 7","Nghỉ thứ 7","Tin đăng không đề cập"]}/><CheckGroup title="Lọc theo danh mục nghề" values={specialties} onChange={setSpecialties} options={["Sales Bán lẻ/Dịch vụ tiêu dùng","Kinh doanh/Bán hàng khác","Sales Tài chính/Ngân hàng","Sales Admin/Sales Support"]} nested={["Chuyên môn Kinh doanh/Bán hàng","Sales Representative/Phát triển kinh doanh","Trợ lý kinh doanh","Account Executive","Sales Dịch vụ kế toán"]}/><label className="mt-5 block border-t pt-5 text-sm font-semibold">Kinh nghiệm<select value={experience} onChange={e=>setExperience(e.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal"><option>Tất cả</option><option>Không yêu cầu</option><option>1 năm</option><option>2 năm</option><option>3 năm</option><option>4 năm</option><option>Từ 5+ năm</option></select></label><label className="mt-5 block text-sm font-semibold">Hình thức làm việc<select value={mode} onChange={e=>setMode(e.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal"><option>Tất cả</option><option>Full-time</option><option>Remote</option><option>Hybrid</option></select></label><button onClick={applyAdvancedFilters} className="mt-6 w-full rounded-xl border border-emerald-600 py-2.5 text-sm font-bold text-emerald-700">Tìm kiếm</button><button onClick={clear} className="mt-2 w-full py-2 text-sm font-semibold text-slate-500">Xóa bộ lọc</button></aside>
  <div><div className="mb-3 flex items-center justify-between"><b>{filtered.length} việc làm phù hợp</b><select value={sort} onChange={e=>setSort(e.target.value)} className="rounded-xl border bg-white px-3 py-2 text-sm"><option>Phù hợp nhất</option><option>Mới nhất</option><option>Lương cao nhất</option></select></div><div className="space-y-3">{visibleJobs.map(job=><article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-md"><div className="flex gap-4"><span className="grid size-16 shrink-0 place-items-center rounded-xl border bg-emerald-50 text-emerald-700"><BriefcaseBusiness className="size-6"/></span><div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><Link href={`/jobs/${job.id}`} className="font-bold text-slate-800 hover:text-emerald-700">{job.title}</Link><b className="text-sm text-emerald-600">{job.salary}</b></div><p className="mt-1 text-sm text-slate-500">{job.company}</p><div className="mt-3 flex flex-wrap gap-2 text-xs">{[job.location,job.experience,job.mode,job.category].map(tag=><span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1">{tag}</span>)}</div><div className="mt-4 flex items-center justify-between border-t pt-3"><span className="text-xs text-slate-500">Đăng {job.age===0?"hôm nay":`${job.age} ngày trước`}</span><div className="flex gap-2"><button aria-label="Lưu việc làm" onClick={()=>{const active=saved.includes(job.id);setSaved(list=>active?list.filter(id=>id!==job.id):[...list,job.id]);toast.success(active?"Đã bỏ lưu tin":"Đã lưu việc làm")}} className={`grid size-9 place-items-center rounded-full border ${saved.includes(job.id)?"border-emerald-500 bg-emerald-50 text-emerald-600":"text-slate-400"}`}><Heart className="size-4" fill={saved.includes(job.id)?"currentColor":"none"}/></button><Link href={`/jobs/${job.id}`} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Xem chi tiết</Link></div></div></div></div></article>)}{filtered.length>0&&<nav aria-label="Phân trang việc làm" className="flex items-center justify-center gap-3 pt-6"><button type="button" aria-label="Trang trước" onClick={()=>setPage(current=>Math.max(0,current-1))} disabled={page===0} className="grid size-9 place-items-center rounded-full border border-emerald-600 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"><ArrowLeft className="size-4"/></button><span className="text-sm text-slate-500"><b className="text-emerald-600">{page+1}</b> / {totalPages} trang</span><button type="button" aria-label="Trang tiếp theo" onClick={()=>setPage(current=>Math.min(totalPages-1,current+1))} disabled={page===totalPages-1} className="grid size-9 place-items-center rounded-full border border-emerald-600 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"><ArrowRight className="size-4"/></button></nav>}{filtered.length===0&&<div className="rounded-2xl border border-dashed bg-white p-10 text-center"><Search className="mx-auto size-10 text-slate-300"/><h2 className="mt-3 font-bold">Không tìm thấy việc làm phù hợp</h2><p className="mt-1 text-sm text-slate-500">Hãy thử từ khóa hoặc bộ lọc khác.</p><button onClick={clear} className="mt-4 text-sm font-bold text-emerald-700">Xóa toàn bộ bộ lọc</button></div>}</div></div></div></section></>
}

function CheckGroup({title,options,nested=[],values,onChange}:{title:string;options:string[];nested?:string[];values:string[];onChange:(values:string[])=>void}){
  const isCategoryFilter = title === "Lọc theo danh mục nghề"
  if (isCategoryFilter) return <CategoryCheckGroup title={title} values={values} onChange={onChange}/>
  const visibleOptions = isCategoryFilter ? JOB_CATEGORY_NAMES : options
  const visibleNested = isCategoryFilter ? [] : nested
  const parentOption = visibleOptions[1]
  const hasNestedOptions = visibleNested.length > 0
  const allChildrenChecked = hasNestedOptions && visibleNested.every((item) => values.includes(item))
  const toggle = (value:string) => onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values,value])
  const toggleParent = () => {
    const next = new Set(values)
    if (allChildrenChecked) {
      next.delete(parentOption)
      visibleNested.forEach((item) => next.delete(item))
    } else {
      next.add(parentOption)
      visibleNested.forEach((item) => next.add(item))
    }
    onChange([...next])
  }
  const toggleChild = (value:string) => {
    const next = new Set(values)
    next.has(value) ? next.delete(value) : next.add(value)
    if (visibleNested.every((item) => next.has(item))) next.add(parentOption)
    else next.delete(parentOption)
    onChange([...next])
  }

  if (isCategoryFilter) {
    const toggleCategory = (category:string, children:readonly string[]) => {
      const next = new Set(values)
      const allChecked = children.every((child) => next.has(child))
      if (allChecked) {
        next.delete(category)
        children.forEach((child) => next.delete(child))
      } else {
        next.add(category)
        children.forEach((child) => next.add(child))
      }
      onChange([...next])
    }
    const toggleSpecialty = (category:string, children:readonly string[], specialty:string) => {
      const next = new Set(values)
      next.has(specialty) ? next.delete(specialty) : next.add(specialty)
      if (children.every((child) => next.has(child))) next.add(category)
      else next.delete(category)
      onChange([...next])
    }
    return <div className="mt-5 border-t pt-5"><h3 className="text-sm font-bold text-slate-800">{title}</h3><div className="mt-3 space-y-3">{JOB_CATEGORIES.map((category) => { const allChecked = category.specialties.every((specialty) => values.includes(specialty)); return <div key={category.code}><label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={allChecked} onChange={() => toggleCategory(category.name, category.specialties)} className="size-4 shrink-0 rounded border-slate-300 accent-emerald-600"/><span className="min-w-0 font-medium">{category.name}</span></label><div className="ml-7 mt-2.5 space-y-2">{category.specialties.map((specialty) => <label key={specialty} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={values.includes(specialty)} onChange={() => toggleSpecialty(category.name, category.specialties, specialty)} className="size-3 shrink-0 rounded border-slate-300 accent-emerald-600"/><span className="min-w-0 rounded-full border border-slate-200 px-2.5 py-1 leading-5">{specialty}</span></label>)}</div></div> })}</div></div>
  }

  return <div className="mt-5 border-t pt-5"><h3 className="text-sm font-bold text-slate-800">{title}</h3><div className="mt-3 space-y-3">{visibleOptions.map((option,index)=>{
    const isParent = index===1 && hasNestedOptions
    return <div key={option}><label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={isParent ? allChildrenChecked : values.includes(option)} onChange={isParent ? toggleParent : ()=>toggle(option)} className="size-4 shrink-0 rounded border-slate-300 accent-emerald-600"/><span className="min-w-0">{option}</span>{index===1&&title.includes("danh mục")&&!isCategoryFilter&&<small className="ml-auto shrink-0 text-slate-400">559</small>}</label>{isParent&&<div className="ml-7 mt-3 space-y-2.5">{visibleNested.map(item=><label key={item} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={values.includes(item)} onChange={()=>toggleChild(item)} className="size-3.5 shrink-0 rounded border-slate-300 accent-emerald-600"/><span className="min-w-0 rounded-full border border-slate-200 px-2.5 py-1 leading-5">{item}</span></label>)}</div>}</div>
  })}</div></div>
}

function CategoryCheckGroup({title,values,onChange}:{title:string;values:string[];onChange:(values:string[])=>void}){
  const [expanded,setExpanded] = useState<Record<string,boolean>>({})
  const toggleCategory = (category:string, specialties:readonly string[]) => {
    const next = new Set(values)
    const allChecked = specialties.every((specialty) => next.has(specialty))
    if (allChecked) {
      next.delete(category)
      specialties.forEach((specialty) => next.delete(specialty))
    } else {
      next.add(category)
      specialties.forEach((specialty) => next.add(specialty))
    }
    onChange([...next])
  }
  const toggleSpecialty = (category:string, specialties:readonly string[], specialty:string) => {
    const next = new Set(values)
    next.has(specialty) ? next.delete(specialty) : next.add(specialty)
    if (specialties.every((item) => next.has(item))) next.add(category)
    else next.delete(category)
    onChange([...next])
  }
  return <div className="mt-5 border-t pt-5"><h3 className="text-sm font-bold text-slate-800">{title}</h3><div className="mt-3 space-y-3">{JOB_CATEGORIES.map((category) => { const allChecked = category.specialties.every((specialty) => values.includes(specialty)); const isExpanded = Boolean(expanded[category.code]); return <div key={category.code}><div className="flex items-center gap-2"><label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={allChecked} onChange={() => toggleCategory(category.name, category.specialties)} className="size-4 shrink-0 rounded border-slate-300 accent-emerald-600"/><span className="min-w-0 font-medium">{category.name}</span></label><button type="button" aria-label={`${isExpanded ? "Thu gọn" : "Mở"} vị trí ${category.name}`} aria-expanded={isExpanded} onClick={() => setExpanded((current) => ({...current,[category.code]:!isExpanded}))} className="grid size-7 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><ChevronDown className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}/></button></div>{isExpanded&&<div className="ml-7 mt-2.5 space-y-2">{category.specialties.map((specialty) => <label key={specialty} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={values.includes(specialty)} onChange={() => toggleSpecialty(category.name, category.specialties, specialty)} className="size-3 shrink-0 rounded border-slate-300 accent-emerald-600"/><span className="min-w-0 rounded-full border border-slate-200 px-2.5 py-1 leading-5">{specialty}</span></label>)}</div>}</div> })}</div></div>
}
