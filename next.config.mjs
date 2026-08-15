/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'crm.gsbondcleaning.com.au',
        pathname: '/uploads/**',
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
