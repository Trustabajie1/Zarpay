/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
    };

    // Ignore MetaMask SDK on server side
    if (isServer) {
      config.externals.push("@metamask/sdk");
    }

    return config;
  },
  experimental: {
    esmExternals: "loose",
  },
};

export default nextConfig;