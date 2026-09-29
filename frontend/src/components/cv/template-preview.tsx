"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {CVDocument} from "./cv-document";
import {getCVSample} from "@/lib/cv-samples";
import type {TemplateId,ThemeId} from "@/lib/cv-layout";
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogTrigger} from "@/components/ui/dialog";
function Paper({template,theme}:{template:TemplateId;theme:ThemeId}){
 const ref=useRef<HTMLDivElement>(null);const [scale,setScale]=useState(0.34);
 useEffect(()=>{const el=ref.current;if(!el)return;const update=()=>setScale(el.clientWidth/794);update();const observer=new ResizeObserver(update);observer.observe(el);return()=>observer.disconnect();},[]);
 return <div ref={ref} className="relative mx-auto aspect-[210/297] w-full overflow-hidden bg-white text-left shadow-md" aria-label="Bản xem trước CV mẫu">
 <div className="absolute left-0 top-0 origin-top-left" style={{width:794,height:1123,transform:"scale("+scale+")"}}><CVDocument data={getCVSample(template)} template={template} theme={theme}/></div></div>;
}
export function TemplatePreview({template,theme,name}:{template:TemplateId;theme:ThemeId;name:string}){
 return <Dialog><DialogTrigger aria-label={"Xem mẫu CV "+name} className="group/preview block w-full rounded-lg outline-offset-4 focus-visible:outline-emerald-600">
 <div className="mx-auto max-w-[270px]"><Paper template={template} theme={theme}/></div>
 <span className="mt-3 block text-sm font-semibold text-emerald-700">Xem mẫu CV</span>
 </DialogTrigger><DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[760px]">
 <DialogTitle>CV {name}</DialogTitle><DialogDescription>Nội dung minh họa. Thay bằng thông tin của bạn trước khi sử dụng.</DialogDescription>
 <Paper template={template} theme={theme}/>
 <Link href={"/cv-builder?template="+template+"&theme="+theme+"&sample=1"} className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-bold text-white">Sử dụng mẫu này</Link>
 </DialogContent></Dialog>;
}
