"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getAccesToken } from "@/actions/auth.action";

export function useImagePreview(file: File | undefined, fallback: string) {
  const [preview, setPreview] = useState<{
    file: File;
    url: string;
  } | null>(null);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return file && preview?.file === file ? preview.url : fallback;
}
