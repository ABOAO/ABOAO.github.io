# 王承皓個人網站（ABOAO.github.io）

這是我用來展示個人簡介與文章的單頁式網站，採用 HTML + SCSS + JavaScript 打造，並配合 GitHub Pages 發佈。

## 🔧 技術棧

- HTML5 / SCSS / JavaScript (Vanilla)
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
README.md                         # 本說明文件
```

## 🚀 部署方式

本網站以 GitHub Pages 發佈：  
[https://aboao.github.io/](https://aboao.github.io/)

## 📌 待辦事項

- [ ] 整合 ScrollTrigger 或 Locomotive Scroll 動畫
- [ ] 設計文章區資料來源（如 JSON 或 Markdown）
- [ ] 優化 RWD 響應式排版
