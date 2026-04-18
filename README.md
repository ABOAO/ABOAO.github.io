# 王承皓個人網站（ABOAO.github.io）

這個專案是部署在 GitHub Pages 的靜態個人網站，目前包含首頁、文章頁，以及一套簡單的 PWA 離線支援。

## 技術組成

- HTML + CSS + Vanilla JavaScript
- Web App Manifest + Service Worker
- Firebase Analytics 初始化
- Google Apps Script 表單投遞

## 專案結構

```
articles/
  └── puzzle-love.html            # 文章頁
assets/
  ├── css/
  │   ├── index.css               # 首頁樣式
  │   ├── main.css                # 文章頁樣式
  │   └── images/
  │       └── 網頁底圖.png         # 文章頁背景圖
  └── js/
      ├── index.js                # 首頁互動與視覺效果
      └── pwa.js                  # service worker / Firebase 初始化
images/
  ├── A.ico                       # favicon
  ├── LOGO.svg                    # PWA icon
  └── 王承皓.jpg                   # 首頁照片
index.html                        # 首頁
manifest.json                     # PWA manifest
offline.html                      # 離線 fallback 頁
service-worker.js                 # 離線快取設定
README.md
```

## 本機查看

這是純靜態網站，用任何能提供靜態檔案的本機伺服器都可以直接開啟。

## 線上網址

https://aboao.github.io/
