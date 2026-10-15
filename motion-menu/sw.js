/* 모션 메뉴판 서비스 워커 — 네트워크 우선, 실패 시에만 캐시 */
var CACHE = "motion-menu-v2";
var ASSETS = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(e) {
  /* 캐시 실패가 설치를 막지 않도록 개별 처리 */
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return Promise.all(ASSETS.map(function(a) { return c.add(a).catch(function(){}); }));
  }).then(function() { return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }).then(function() { return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(res) {
      /* 정상 응답(200)만 캐시. 404 등은 캐시하지 않음 */
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function() { return caches.match(e.request); })
  );
});
