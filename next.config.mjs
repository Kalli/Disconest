/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{
          protocol: 'https',
          hostname: 'i.discogs.com',
          port: '',
          pathname: '/**',
        },{
          protocol: 'https',
          hostname: 'images.juno.co.uk',
          port: '',
          pathname: '/**',
        },{
          protocol: 'https',
          hostname: 'affiliate.juno.co.uk',
          port: '',
          pathname: '/**',
        },
      ],
    },
}

export default nextConfig;
