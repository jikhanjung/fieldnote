# 필드노트

위경도·메모·사진을 폰 안에 남기는 개인용 야외 기록 앱. 서버 없이 GitHub Pages 의 정적 파일만으로 돈다.

https://jikhanjung.github.io/fieldnote/

## 쓰는 법

1. 폰 브라우저로 위 주소를 열고 "홈 화면에 추가" 한다 (아이폰은 꼭 — 안 하면 사파리가 오래 안 연 사이트의 자료를 지운다)
2. ⚙ 설정에 VWorld 인증키를 넣는다 — 키는 `jikhanjung.github.io` 도메인으로 발급받은 것이어야 한다. 키가 없으면 OpenStreetMap 으로 보인다
3. ＋ 를 누르면 지금 GPS 자리에 새 기록이 생긴다. 지도를 길게 누르면 그 자리에 생긴다
4. 하루가 끝나면 ⚙ → 백업 → zip 내려받기 (또는 공유로 보내기)

## 자료는 어디에

- 기록과 사진: 그 브라우저의 IndexedDB (`fieldnote` DB). 사진은 긴 변 2000 px JPEG 로 줄여 담는다
- VWorld 키·배경·마지막 내보내기 시각: localStorage (`fieldnote.*`)
- 한 번 본 VWorld 타일: 서비스 워커의 Cache Storage (`fieldnote-tiles`, 4000 장까지). 가기 전에 그 지역을 미리 둘러보면 망 없이도 배경이 보인다
- 저장소에는 아무 자료도 올라가지 않는다

zip 은 `notes.geojson`(점, 속성에 제목·메모·시각·GPS 정확도·사진 파일 이름)과 `photos/` 다. QGIS 에서 바로 열린다.
같은 zip 을 "zip 들이기" 로 다시 넣으면 되살아난다(같은 기록은 더 새 것만 덮는다).

## 파일

- `index.html` — 앱 전부 (Leaflet, JSZip 은 `vendor/` 에 받아 두었다 — 서비스 워커가 담아 망 없이 열리게)
- `sw.js` — 서비스 워커. 앱 파일을 바꾸면 `APP` 의 판(`fieldnote-app-v1`)을 올려야 폰이 새 것을 받는다
- `manifest.webmanifest`, `icon*` — 홈 화면 설치
