import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chope & Take',
    short_name: 'Chope',
    description:
      "Singapore's community app for giving away and collecting free items. Chope your lobang today!",
    start_url: '/',
    display: 'standalone',
    background_color: '#FF6B4A',
    theme_color: '#FF6B4A',
    orientation: 'portrait',
    icons: [
      {
        src: '/chopeicon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/chopeicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
