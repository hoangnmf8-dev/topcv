"use client";
import {useFormContext} from "react-hook-form";
import type {CvFormValues} from "@/validators/cv.validate";
export function CvErrors({path}:{path:string}) {
 const {formState:{errors}}=useFormContext<CvFormValues>();
 let value:unknown=errors;
 for(const key of path.split(".")){value=value && typeof value==="object" ? (value as Record<string,unknown>)[key] : undefined;}
 function messages(node:unknown):string[]{
  if(!node || typeof node!=="object")return [];
  const record=node as Record<string,unknown>;
  if(typeof record.message==="string")return [record.message];
  return Object.entries(record).filter(([key])=>key!=="ref").flatMap(([,v])=>messages(v));
 }
 const items=[...new Set(messages(value))];
 return items.length ? <div role="alert" className="text-xs text-red-600">{items.map(text=><p key={text}>{text}</p>)}</div>:null;
}
