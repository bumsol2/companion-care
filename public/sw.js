// 최소한의 서비스 워커 구현 - 404 에러 방지용
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// 기본 fetch 이벤트 리스너
self.addEventListener('fetch', (event) => {
  // 기본 네트워크 요청만 처리
  event.respondWith(
    fetch(event.request).catch(() => {
      // 오프라인 상태일 때 오프라인 페이지로 리다이렉트
      if (event.request.mode === 'navigate') {
        return caches.match('/offline');
      }
      return new Response('Offline');
    })
  );
});
