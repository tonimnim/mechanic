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
        src: 'https://api.dicebear.com/7.x/icons/png?seed=Mechanic&scale=100&size=192', // Placeholder icon
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://api.dicebear.com/7.x/icons/png?seed=Mechanic&scale=100&size=512', // Placeholder icon
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
