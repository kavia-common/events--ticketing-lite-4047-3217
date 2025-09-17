import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic app with API-driven pages; static export is not compatible with
  // dynamic route /events/[eventId] without generateStaticParams.
  // Use default Node server output.
};

export default nextConfig;
