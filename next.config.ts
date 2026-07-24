import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pizzip", "docxtemplater"],
  allowedDevOrigins: ["*.loca.lt", "honest-turtles-drop.loca.lt", "localhost:3000"],
};

export default nextConfig;
