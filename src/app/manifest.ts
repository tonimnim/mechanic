import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'eGarage Kenya',
    short_name: 'eGarage',
    description: 'Find trusted mechanics and spare parts in Kenya.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb', // Blue-600
    icons: [
      {
        src: '/logo.jpg',
        sizes: '612x612',
        type: 'image/jpeg',
      },
    ],
  }
}
