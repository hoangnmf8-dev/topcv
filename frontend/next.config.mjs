const publicImageUrl = new URL(
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ||
    "https://pub-5b7a092e5855478eb3d5d161453478e7.r2.dev",
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: publicImageUrl.hostname,
        port: "",
        pathname: "/seed/topcv/**",
        search: "",
      },
    ],
  },
};
export default nextConfig;
