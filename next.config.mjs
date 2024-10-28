import MillionLint from '@million/lint'
/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['@node-rs/argon2'],
    },
    env: {
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    },
}

export default MillionLint.next({
    enabled: true,
    rsc: true,
})(nextConfig)
