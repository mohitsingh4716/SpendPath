/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "randomuser.me",
          },
        ],
      },
    
      experimental: {
        serverActions: {
          bodySizeLimit: "5mb",
        },
      },

    serverExternalPackages: ["@sparticuz/chromium"],

    webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@sparticuz/chromium");
    }
    return config;
  },
};

export default nextConfig;
