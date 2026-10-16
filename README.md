# 🚀 Neon Breakout (經典打磚塊遊戲)

一個以 React + TypeScript + Tailwind CSS 和 HTML5 Canvas 打造的現代化街機打磚塊遊戲。具備順暢物理碰撞、豐富道具、多種特殊磚塊、合成音效系統、多關卡設計與成就記錄。

![Neon Breakout Banner](https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80)

---

## 🎮 遊戲特色

- **經典街機操控**：支援滑鼠游標、觸控拖曳滑動與鍵盤方向鍵 (`←` / `→` 或 `A` / `D`)。
- **高刷新物理引擎**：高 DPI 畫質支援、基於擊球點角度彈射、流暢粒子爆炸破碎特效。
- **豐富磚塊種類**：
  - 🟩 **標準磚塊**：1 次擊破。
  - 🛡️ **裝甲鐵磚**：需擊打 2~3 次，外層有防護裂紋指示。
  - 💥 **連鎖炸彈磚**：引爆時波及周圍九宮格磚塊。
  - 💎 **神秘獎勵磚**：必掉落隨機強力道具。
- **多元技能道具**：
  - ⚾ **三球分裂 (Multiball)**：分裂額外兩顆球！
  - 🚀 **雙聯雷射砲 (Laser Paddle)**：按空白鍵或滑鼠點擊發射雷射摧毀磚塊！
  - 📏 **加寬球拍 (Expand Paddle)**：大幅提升接球容錯率。
  - 🛡️ **能量安全底網 (Floor Shield)**：底部產生防護網拯救落空的球。
  - 🐢 **時光減速 (Slow Motion)**：降低球速便於精準操控。
  - ❤️ **額外生命 (+1 Life)**：增加一條生命。
- **Web Audio 8-bit 合成音響**：純原生瀏覽器音訊合成器（撞擊、破碎、爆炸、發射雷射、過關音效），無需外部音訊資源。
- **連擊得分與最高分記錄**：連擊 Combo 加成機制，自動儲存至 LocalStorage。
- **多關卡進度與關卡選擇**：經典梯形、外星入侵者陣型、堡壘要塞、鑽石金字塔等多樣設計。

---

## 🛠️ 本地開發與執行

### 1. 系統需求
- [Node.js](https://nodejs.org/) (建議 v18 以上版本)
- [Git](https://git-scm.com/)

### 2. 安裝步驟

```bash
# 1. 複製專案庫到本機
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 2. 進入專案資料夾
cd YOUR_REPOSITORY

# 3. 安裝依賴套件
npm install

# 4. 啟動本機開發伺服器
npm run dev
```

開啟瀏覽器並造訪 `http://localhost:3000` 即可開始遊玩！

### 3. 建置生產環境版本 (Production Build)

```bash
npm run build
npm run preview
```

---

## 💻 鍵盤與滑鼠操作指南

| 操作 | 按鍵 / 行為 |
| :--- | :--- |
| **移動球拍** | 滑鼠左右移動 / 觸控拖曳 / 鍵盤 `←` `→` 或 `A` `D` |
| **發球 / 發射雷射** | `空白鍵 (Space)` 或 滑鼠點擊畫布 |
| **暫停 / 繼續** | `P` 或 `Esc` 鍵 |
| **音效切換** | 點擊頂部或畫面角落的喇叭圖示 |

---

## 📦 技術棧 (Tech Stack)

- **框架**：React 19 + TypeScript
- **構建工具**：Vite 8
- **樣式庫**：Tailwind CSS v4
- **圖標庫**：Lucide React
- **動畫與特效**：Canvas 2D API + Canvas Confetti
- **專案打包匯出**：JSZip

---

## 📄 開源授權

本專案採用 [MIT License](LICENSE) 授權。歡迎自由修改、Fork 與分享！
