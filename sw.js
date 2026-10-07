// aionio 서비스워커 — 네트워크 우선(브라우저 HTTP 캐시 무시), 실패 시 캐시 (오프라인에서도 화면이 뜨게)
// 새 버전을 올릴 때 CACHE 이름을 바꿀 필요 없음: 항상 서버의 최신 파일을 먼저 가져옴
const CACHE = 'aionio-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // 파이어베이스 등 외부 요청은 브라우저 기본 동작에 맡김
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    // cache:'no-store' → GitHub Pages의 HTTP 캐시(약 10분)를 건너뛰고 항상 최신본 요청
    fetch(e.request, { cache: 'no-store' })
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
