import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"
import { ChatWidget } from "@/components/chat-widget"
import { SonnerStatusBridge } from "@/components/sonner-status-bridge"
import "./globals.css"
import { QueryProvider } from "@/providers/query-provider"

export const metadata: Metadata = {
  title: "TopViec / TopCV",
  description: "Nền tảng tuyển dụng với các giao diện gốc được chuyển sang một ứng dụng Next.js duy nhất.",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#00b14f",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
        <SonnerStatusBridge />
        <ChatWidget />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
