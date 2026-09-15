"use client";
import { useEffect } from "react";
import { toast } from "sonner";

export function SonnerStatusBridge() {
  useEffect(() => {
    const show = (element: HTMLElement) => {
      if (element.dataset.sonnerHandled === "true") return;
      const message = element.textContent
        ?.replace(/\s+/g, " ")
        .replace(/^(✓|✕)\s*/, "")
        .trim();
      if (!message) return;
      element.dataset.sonnerHandled = "true";
      element.hidden = true;
      const lower = message.toLowerCase();
      if (
        lower.includes("lỗi") ||
        lower.includes("không hợp lệ") ||
        lower.includes("vui lòng")
      )
        toast.error(message);
      else toast.success(message);
    };
    const scan = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>('[role="status"]').forEach(show);
    scan(document);
    const observer = new MutationObserver((mutations) =>
      mutations.forEach((mutation) =>
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('[role="status"]')) show(node);
          scan(node);
        }),
      ),
    );
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
