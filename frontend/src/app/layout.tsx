import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ChatWidget } from "@/components/chat-widget";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ChatProvider } from "@/providers/chat-provider";
import AuthProvider from "@/providers/auth-provider";

export const metadata: Metadata = {
  title: "TopViec / TopCV",
  description:
    "Nền tảng tuyển dụng hàng đầu.",
  icons: {
    icon: "/favicon.ico"
  }
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#00b14f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider><ChatProvider>{children}</ChatProvider></AuthProvider>
        </QueryProvider>
        <ChatWidget />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
