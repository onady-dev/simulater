/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true, // S3 라우팅 호환성을 위해 권장
};

export default nextConfig;
