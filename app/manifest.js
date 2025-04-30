export default function manifest() {
  return {
    name: 'Companion Care',
    short_name: 'Companion',
    description: '반려 식물과 반려동물을 위한 케어 리마인더 앱',
    start_url: '/',
    display: 'standalone',
    background_color: '#A7D7A7',
    theme_color: '#A7D7A7',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
}
