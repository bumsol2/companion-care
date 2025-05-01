// 최소한의 서비스 워커 구현 - 404 에러 방지용
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// 기본 fetch 이벤트 리스너 - 오류 방지용 최소 구현
self.addEventListener('fetch', (event) => {
  // 네트워크 요청을 그대로 통과시키고 오류 처리만 추가
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('Offline mode');
      })
    );
  }
});
