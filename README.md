# 王承皓個人網站（ABOAO.github.io）

這是我用來展示個人簡介與文章的單頁式網站，採用 HTML + SCSS + JavaScript 打造，並配合 GitHub Pages 發佈。

## 🔧 技術棧

- HTML5 / SCSS / JavaScript (Vanilla)
- PWA（Web App Manifest + Service Worker + Offline Cache）
- Firebase Web SDK（Analytics 初始化）
- GSAP（未來規劃加入動畫）
- 單頁式設計（One Page Design）
- 表單串接 Google Apps Script 作為聯絡方式

## 📁 專案結構

```
assets/
  ├── css/
  │   ├── main.css                # 編譯後 CSS
  │   └── images/                 # 舊版背景圖（可清理）
  ├── js/
  │   └── main.js                 # 一頁式初始化 JS
  ├── sass/
  │   ├── main.scss               # SCSS 原始樣式
  │   ├── libs/                   # 原本引用外部樣式，可清理
  │   └── webfonts/               # 字體資源夾（如沒用可刪）
images/
  ├── 王承皓.jpg                   # 大頭貼
  ├── A.ico                       # favicon
  ├── LOGO.svg / Footer image.svg # LOGO 與底圖（看使用情況）
index.html                        # 網站首頁（單頁式）
manifest.json                     # PWA manifest
offline.html                      # 離線 fallback 頁
service-worker.js                 # PWA 快取與離線支援
README.md                         # 本說明文件
```

## 🚀 部署方式

本網站以 GitHub Pages 發佈：  
[https://aboao.github.io/](https://aboao.github.io/)

## UV 本機啟動

這個專案目前是靜態網站，不需要額外的 Python 套件也能啟動。本地開發可直接使用：

```bash
uv sync
uv run python -m http.server 8000
```

接著開啟 `http://localhost:8000`。

如果之後要加入 Python 套件，使用：

```bash
uv add 套件名
```

例如：

```bash
uv add fastapi
uv add --dev ruff
```

常用指令：

```bash
uv remove 套件名
uv sync
uv lock
uv run python your_script.py
```


