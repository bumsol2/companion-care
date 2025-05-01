// Service Worker for Companion Care
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 기본 네트워크 요청 처리
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // 오프라인 상태일 때 오프라인 페이지로 리다이렉트
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
        return caches.match(event.request);
      })
  );
});
