// 필드노트 서비스 워커
//  - 앱 파일(같은 곳)은 담아 두고 망이 없으면 거기서 낸다. 페이지는 망 먼저 — 새 판이 늦게 뜨지 않게
//  - VWorld 지도 타일은 한 번 본 것을 담아 두었다가 망이 없을 때 낸다. 많아지면 오래된 것부터 지운다
var APP = "fieldnote-app-v1";
var TILES = "fieldnote-tiles";
var TILE_MAX = 4000;
var SHELL = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-192.png", "icon-512.png",
             "vendor/leaflet.min.js", "vendor/leaflet.min.css", "vendor/jszip.min.js"];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(APP).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.filter(function (n) { return n.indexOf("fieldnote-app-") === 0 && n !== APP; })
                            .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

// OSM 타일은 담지 않는다 — OSM 타일 서버 이용 정책이 기기에 쌓아 두는 것을 반기지 않는다. 키가 없을 때의 임시 배경이다
function isTile(url) {
  return url.hostname === "api.vworld.kr" && url.pathname.indexOf("/req/wmts/") === 0;
}

var puts = 0;
function trim(cache) {
  return cache.keys().then(function (keys) {
    if (keys.length <= TILE_MAX) return;
    return Promise.all(keys.slice(0, keys.length - TILE_MAX).map(function (k) { return cache.delete(k); }));
  });
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  if (isTile(url)) {
    event.respondWith(caches.open(TILES).then(function (c) {
      return c.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          // CORS 로 받은 정상 응답만 담는다 — 불투명 응답은 저장 한도를 크게 잡아먹는다
          if (res.ok && res.type === "cors") {
            c.put(req, res.clone()).then(function () { if (++puts % 200 === 0) trim(c); });
          }
          return res;
        });
      });
    }));
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(APP).then(function (c) { c.put("index.html", copy); }); }
      return res;
    }).catch(function () { return caches.match("index.html"); }));
    return;
  }
  event.respondWith(caches.match(req).then(function (hit) {
    return hit || fetch(req);
  }));
});
