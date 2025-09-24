### 🤖 Assistant



# AI 管理天地：產品規格書

## 目錄
1. [產品概述](#產品概述)
2. [設計原則](#設計原則)
3. [技術規格](#技術規格)
4. [核心功能](#核心功能)
   - [4.1 AI 聊天](#ai-聊天)
   - [4.2 蕃茄鐘](#蕃茄鐘)
   - [4.3 筆記本](#筆記本)
   - [4.4 任務中心](#任務中心)
   - [4.5 專案管理](#專案管理)
5. [資料結構](#資料結構)
6. [頁面結構與導航](#頁面結構與導航)
7. [使用者介面設計](#使用者介面設計)
8. [開發規劃](#開發規劃)
9. [附錄：API 規格](#附錄api-規格)

<a id="產品概述"></a>
## 1. 產品概述

「AI 管理天地」是一個全方位的個人生活管理網頁應用程式，為專業自由工作者提供全面的生產力工具。應用整合了 AI 技術，協助使用者管理日常工作、專案進度、個人筆記及時間規劃。產品核心價值在於將複雜的個人管理需求融入簡潔的介面，透過 AI 技術提供智能化的管理體驗。

### 1.1 使用情境

專為個人使用者設計，特別是自由工作者或專業人士，以協助管理工作進度、時間安排、筆記整理及專案追蹤，讓使用者能在多維度的生活管理需求中保持高效率。

### 1.2 核心價值主張

- **全面整合**：將五大核心功能整合於單一平台
- **AI 驅動**：利用頂尖 AI 模型提供深度洞察和個人化建議
- **極簡設計**：符合蘋果設計理念的清晰、簡潔使用者介面
- **個人化體驗**：可自訂的 AI 導師風格及使用偏好設定
- **一體化記憶**：所有活動和互動形成個人知識庫，助力長期成長

<a id="設計原則"></a>
## 2. 設計原則

### 2.1 視覺設計

- **極簡主義**：每個頁面僅呈現必要元素，減少視覺干擾
- **多巴胺配色方案**：使用明亮、愉悅的色彩，促進使用動力
  - 主色：#FF5A5F（珊瑚紅）
  - 次要色：#FFB400（金黃色）
  - 輔助色：#3A86FF（活力藍）
  - 背景色：#FFFFFF（純白）
  - 文字色：#333333（深灰）
  - 強調色：#8A2BE2（紫色）
- **一致性**：所有元素的設計語言保持一致
- **空間運用**：適當的留白創造呼吸感
- **層次感**：清晰的視覺層次，引導使用者注意重點

### 2.2 交互設計

- **直覺操作**：減少操作步驟，提高任務完成效率
- **回饋即時**：所有操作都有明確的視覺反饋
- **流暢過渡**：頁面和元素之間的轉換動畫流暢自然
- **預設智能**：系統能預測使用者需求，主動提供建議
- **錯誤寬容**：提供清晰的錯誤提示和修復途徑

### 2.3 內容組織

- **模塊化**：內容按功能清晰分組
- **層級導航**：主要功能一覽無遺，次要功能有序展開
- **上下文相關**：相關內容自然連結，減少跳轉
- **重點突出**：關鍵信息和常用功能優先展示

<a id="技術規格"></a>
## 3. 技術規格

### 3.1 前端技術棧

- **框架**：React 18 (使用 TypeScript)
- **狀態管理**：Redux Toolkit
- **路由**：React Router 6
- **UI 組件庫**：自定義組件 + Tailwind CSS
- **圖表**：Chart.js
- **甘特圖**：React Gantt Chart
- **拖放功能**：react-beautiful-dnd
- **日期處理**：date-fns
- **Markdown 渲染**：react-markdown

### 3.2 後端服務

- **資料存儲**：localStorage 和 IndexedDB (純前端應用)
- **AI 整合**：Open Router API
- **資料匯出**：自定義 JSON 格式

### 3.3 支援裝置與響應式設計

- **桌面**：最佳體驗，完整功能支援
  - 最小螢幕寬度：1024px
  - 最佳螢幕寬度：1440px 及以上
- **平板**：適配體驗，所有功能可用
  - 螢幕寬度：768px - 1023px
- **行動裝置**：基本功能支援
  - 螢幕寬度：320px - 767px

### 3.4 瀏覽器支援

- Chrome 最新版
- Firefox 最新版
- Safari 最新版
- Edge 最新版

<a id="核心功能"></a>
## 4. 核心功能

<a id="ai-聊天"></a>
### 4.1 AI 聊天

#### 4.1.1 功能概述

AI 聊天功能提供全方位的對話式助理體驗，支援從日常對話到專業建議的各種互動。使用者可自訂 AI 導師風格，讓互動體驗更貼合個人需求。

#### 4.1.2 核心功能

- **多模型支援**：透過 Open Router API 連接並切換不同 AI 模型
- **個性化導師風格**：
  - 預設風格：極簡風格、槓桿思維、長期價值導向
  - 自訂風格：允許使用者定義專屬導師特質
- **對話記憶**：保存歷史對話，形成個人知識庫
- **上下文理解**：AI 能理解並延續對話脈絡
- **多維度輔助**：
  - 生產力提升建議
  - 學習輔導
  - 職業發展指導
  - 健康管理建議
  - 家庭關係指導
  - 財富管理諮詢

#### 4.1.3 使用者介面

- **聊天視窗**：
  - 對話氣泡式設計
  - 使用者訊息右側對齊（珊瑚紅背景）
  - AI 回應左側對齊（淺灰背景）
  - 支援 Markdown 格式顯示
- **輸入區域**：
  - 多行文本輸入框
  - 發送按鈕（主色調）
  - 快捷功能按鈕（上傳檔案、清除對話）
- **模型選擇下拉選單**：
  - 顯示當前使用的模型
  - 可快速切換不同 AI 模型
- **風格設定面板**：
  - 預設風格快速選擇
  - 自訂風格編輯器

#### 4.1.4 互動流程

1. 使用者選擇或設定 AI 導師風格
2. 選擇要使用的 AI 模型
3. 在輸入框中輸入訊息並發送
4. AI 處理請求並返回回應
5. 對話內容自動保存至歷史記錄
6. 使用者可繼續對話或開始新對話

<a id="蕃茄鐘"></a>
### 4.2 蕃茄鐘

#### 4.2.1 功能概述

蕃茄鐘功能幫助使用者維持專注，管理工作與休息時間，並透過 AI 分析提供改進建議。系統會記錄使用者的工作習慣，幫助優化時間利用效率。

#### 4.2.2 核心功能

- **可自訂時間區間**：
  - 工作時段（預設 25 分鐘）
  - 短休息（預設 5 分鐘）
  - 長休息（預設 15 分鐘）
- **專注提醒**：
  - 視覺與音效通知
  - 可選的桌面通知
- **習慣追蹤**：
  - 記錄完成的蕃茄鐘次數
  - 專注時段分析
  - 中斷記錄與原因分類
- **AI 分析與建議**：
  - 基於使用習慣的個人化建議
  - 專注模式優化建議
  - 與任務完成效率的關聯分析
- **整合功能**：
  - 與任務中心連動
  - 可直接為特定任務計時

#### 4.2.3 使用者介面

- **主計時器**：
  - 大型數字顯示（剩餘時間）
  - 環形進度指示器
  - 當前狀態指示（工作/休息）
- **控制按鈕**：
  - 開始/暫停（主色調）
  - 重設（次要色調）
  - 跳過（輔助色調）
- **設定面板**：
  - 時間長度調整滑桿
  - 通知設定開關
  - 聲音設定選項
- **統計儀表板**：
  - 每日/週/月完成的蕃茄鐘數量
  - 專注時間趨勢圖
  - 中斷頻率與原因分析

#### 4.2.4 互動流程

1. 使用者可選擇性地設定工作任務
2. 調整時間設定（如需要）
3. 啟動計時器開始工作
4. 系統倒數計時並顯示進度
5. 時間結束時通知使用者休息
6. 休息結束後提示開始新的工作階段
7. 系統自動記錄完成情況
8. AI 定期分析使用習慣並提供建議

<a id="筆記本"></a>
### 4.3 筆記本

#### 4.3.1 功能概述

筆記本功能提供全面的筆記管理與 AI 增強洞察。使用者可建立、編輯和組織各種格式的筆記，並讓 AI 分析筆記內容，提供總結、重點提取和建議。

#### 4.3.2 核心功能

- **多格式筆記**：
  - 文字（支援 Markdown 格式）
  - 圖片附件
  - 檔案附件
  - 語音記錄（自動轉文字）
- **組織功能**：
  - 資料夾結構
  - 標籤系統
  - 搜尋功能（全文搜尋）
- **AI 增強功能**：
  - 選定範圍分析
  - 自動摘要生成
  - 關鍵點提取
  - 相關任務建議
  - 長期趨勢分析
- **整合功能**：
  - 一鍵將 AI 建議轉為任務
  - 筆記與專案/任務關聯

#### 4.3.3 使用者介面

- **筆記列表**：
  - 左側資料夾/標籤導航
  - 中間筆記列表（預覽卡片式）
  - 排序與過濾選項
- **編輯器**：
  - 富文本工具列
  - Markdown 支援
  - 媒體插入按鈕
  - 自動儲存指示器
- **AI 洞察面板**：
  - 可展開/收合的右側面板
  - 洞察類型選擇器
  - 互動式洞察結果顯示
  - 一鍵操作按鈕（建立任務、複製等）

#### 4.3.4 互動流程

1. 使用者建立新筆記或選擇現有筆記
2. 編輯筆記內容（文字、圖片、語音等）
3. 選擇特定內容範圍或整個筆記請求 AI 分析
4. 選擇分析類型（摘要、關鍵點、建議等）
5. AI 處理並在右側面板顯示結果
6. 使用者可直接操作 AI 洞察（如轉為任務）
7. 系統自動保存筆記和分析結果

<a id="任務中心"></a>
### 4.4 任務中心

#### 4.4.1 功能概述

任務中心提供全面的個人任務管理功能，按重要性和緊急性分類，協助使用者在多個維度有效管理單一任務。系統支援任務追蹤、優先級設定和完成度監控。

#### 4.4.2 核心功能

- **任務分類**：
  - 四象限法（重要/緊急矩陣）
  - 自定義類別
  - 標籤系統
- **任務屬性**：
  - 標題與描述
  - 截止日期與提醒
  - 優先級（高、中、低）
  - 估計完成時間
  - 關聯資源（筆記、檔案）
- **視圖選項**：
  - 列表視圖（可分組）
  - 日曆視圖
  - 四象限矩陣視圖
- **進度追蹤**：
  - 任務狀態（待辦、進行中、已完成）
  - 子任務支援
  - 完成度百分比
- **AI 輔助**：
  - 任務優先級建議
  - 時間估算輔助
  - 相關任務建議

#### 4.4.3 使用者介面

- **任務總覽**：
  - 狀態統計卡片（待辦/進行中/完成）
  - 今日待辦快速視圖
  - 視圖切換選項
- **任務列表**：
  - 可展開/收合的任務卡片
  - 拖放排序功能
  - 視覺化優先級指示器
  - 截止日期倒數提示
- **任務詳情**：
  - 詳細資訊表單
  - 子任務清單
  - 關聯資源連結
  - 時間記錄器（與蕃茄鐘整合）
- **四象限視圖**：
  - 互動式重要/緊急矩陣
  - 可拖曳任務卡片
  - 顏色編碼優先級

#### 4.4.4 互動流程

1. 使用者建立新任務或選擇現有任務
2. 設定任務詳情（標題、描述、截止日期等）
3. 系統自動或在使用者指引下分類任務
4. 使用者可在不同視圖中查看和管理任務
5. 可直接從任務啟動蕃茄鐘計時
6. 任務完成後標記狀態並記錄結果
7. AI 定期分析任務完成情況提供建議

<a id="專案管理"></a>
### 4.5 專案管理

#### 4.5.1 功能概述

專案管理功能提供結構化的大型專案追蹤系統，整合多個任務及里程碑，支援看板、甘特圖等多種視圖，協助使用者有效管理複雜專案。

#### 4.5.2 核心功能

- **專案結構**：
  - 專案概覽
  - 多層級任務組織
  - 里程碑設定
  - 資源分配
- **視圖選項**：
  - 看板視圖（工作流程）
  - 甘特圖（時間線）
  - 里程碑視圖
  - 資源視圖
- **進度追蹤**：
  - 整體完成度監控
  - 關鍵路徑識別
  - 瓶頸警示
  - 延遲預警
- **協作準備**：
  - 匯出功能
  - 完整專案報告生成
- **AI 輔助**：
  - 進度風險評估
  - 資源優化建議
  - 專案計劃優化

#### 4.5.3 使用者介面

- **專案儀表板**：
  - 進度摘要卡片
  - 關鍵里程碑時間線
  - 待辦任務提示
  - 風險警示（如有）
- **看板視圖**：
  - 可自訂工作流程欄位
  - 拖放任務卡片
  - 任務卡片上的關鍵信息
  - 過濾與搜尋功能
- **甘特圖視圖**：
  - 互動式時間軸
  - 任務依賴關係顯示
  - 關鍵路徑高亮
  - 調整日期的拖曳功能
- **里程碑視圖**：
  - 時間線設計
  - 里程碑詳情卡片
  - 完成狀態指示器

#### 4.5.4 互動流程

1. 使用者建立新專案或選擇現有專案
2. 設定專案結構（任務、里程碑等）
3. 選擇合適的視圖進行管理
4. 追蹤任務進度並更新狀態
5. 查看 AI 提供的進度分析和建議
6. 調整專案計劃（如需要）
7. 專案完成後生成總結報告

<a id="資料結構"></a>
## 5. 資料結構

### 5.1 使用者設定

```javascript
userSettings = {
  id: "unique-id",
  displayName: "使用者名稱",
  theme: "light", // 或 "dark"
  language: "zh-TW",
  aiSettings: {
    defaultModel: "gpt-4",
    customStyles: [
      {
        id: "style-1",
        name: "極簡風格",
        description: "簡潔直接的回應風格",
        prompt: "你是一個極簡風格的助手，提供簡潔明了的回應，避免冗長解釋。"
      },
      // 其他自訂風格...
    ],
    activeStyleId: "style-1"
  },
  pomodoroSettings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    alarmSound: "bell",
    alarmVolume: 0.8
  },
  notificationSettings: {
    desktop: true,
    sound: true,
    taskReminders: true,
    pomodoroAlerts: true
  }
}
```

### 5.2 AI 聊天

```javascript
conversation = {
  id: "conv-123",
  title: "職業發展諮詢",
  modelId: "gpt-4",
  styleId: "style-1",
  createdAt: "2023-10-15T10:30:00Z",
  updatedAt: "2023-10-15T11:20:00Z",
  messages: [
    {
      id: "msg-1",
      role: "user",
      content: "我想了解如何提升我的專案管理技能",
      timestamp: "2023-10-15T10:30:00Z"
    },
    {
      id: "msg-2",
      role: "assistant",
      content: "提升專案管理技能的三個關鍵方向：\n1. 取得認證（如PMP）\n2. 使用專案管理工具精通化\n3. 提升軟技能，特別是溝通和領導力\n\n想從哪個方向深入討論？",
      timestamp: "2023-10-15T10:30:30Z"
    },
    // 更多訊息...
  ]
}
```

### 5.3 蕃茄鐘記錄

```javascript
pomodoroSession = {
  id: "pom-456",
  startTime: "2023-10-15T14:00:00Z",
  endTime: "2023-10-15T16:30:00Z",
  completedPomodoros: 3,
  totalWorkTime: 75, // 分鐘
  totalBreakTime: 20, // 分鐘
  interruptions: [
    {
      time: "2023-10-15T14:20:00Z",
      reason: "電話中斷",
      duration: 5 // 分鐘
    }
    // 其他中斷...
  ],
  associatedTaskId: "task-789", // 關聯的任務 ID（如有）
  notes: "今天專注度較好，但第二個蕃茄鐘被電話打斷"
}

// 蕃茄鐘統計資料
pomodoroStats = {
  daily: {
    date: "2023-10-15",
    totalPomodoros: 8,
    totalWorkTime: 200, // 分鐘
    completionRate: 0.85, // 85% 的計劃蕃茄鐘完成
    interruptions: 3
  },
  weekly: {
    // 類似每日統計，但按週彙總
  },
  monthly: {
    // 類似每日統計，但按月彙總
  }
}
```

### 5.4 筆記

```javascript
note = {
  id: "note-234",
  title: "專案構想：個人 AI 助手",
  content: "# 專案構想\n\n## 核心功能\n- AI 對話\n- 時間管理\n- 筆記整理\n\n## 技術需求\n...",
  format: "markdown",
  createdAt: "2023-10-10T09:00:00Z",
  updatedAt: "2023-10-15T11:45:00Z",
  folderId: "folder-123",
  tags: ["專案", "AI", "構想"],
  attachments: [
    {
      id: "att-1",
      name: "參考設計.png",
      type: "image/png",
      size: 256000,
      url: "data:image/png;base64,..."
    }
    // 其他附件...
  ],
  aiInsights: [
    {
      id: "insight-1",
      type: "summary",
      content: "這個筆記描述了一個個人 AI 助手專案，包含 AI 對話、時間管理和筆記整理三大核心功能。",
      createdAt: "2023-10-15T12:00:00Z"
    },
    {
      id: "insight-2",
      type: "tasks",
      content: [
        "研究 AI API 整合選項",
        "設計使用者介面原型",
        "評估技術可行性"
      ],
      createdAt: "2023-10-15T12:01:00Z"
    }
    // 其他洞察...
  ]
}

// 筆記資料夾結構
noteFolder = {
  id: "folder-123",
  name: "專案構想",
  parentId: null, // 頂層資料夾
  createdAt: "2023-10-01T10:00:00Z",
  updatedAt: "2023-10-15T11:45:00Z",
  color: "#3A86FF"
}
```

### 5.5 任務

```javascript
task = {
  id: "task-789",
  title: "完成 AI 管理天地原型設計",
  description: "設計使用者介面原型，包括所有五大核心功能的頁面佈局",
  status: "in-progress", // "to-do", "in-progress", "completed", "cancelled"
  priority: "high", // "low", "medium", "high"
  quadrant: "important-urgent", // "important-urgent", "important-not-urgent", "not-important-urgent", "not-important-not-urgent"
  dueDate: "2023-10-20T23:59:59Z",
  estimatedTime: 120, // 分鐘
  actualTime: 90, // 已花費分鐘（目前）
  completionPercentage: 60,
  tags: ["設計", "UI", "原型"],
  createdAt: "2023-10-12T15:00:00Z",
  updatedAt: "2023-10-15T16:40:00Z",
  reminders: [
    {
      time: "2023-10-19T10:00:00Z",
      message: "明天截止：完成原型設計"
    }
  ],
  subtasks: [
    {
      id: "subtask-1",
      title: "設計 AI 聊天介面",
      completed: true
    },
    {
      id: "subtask-2",
      title: "設計蕃茄鐘介面",
      completed: true
    },
    {
      id: "subtask-3",
      title: "設計筆記本介面",
      completed: false
    }
    // 更多子任務...
  ],
  relatedNoteIds: ["note-234"],
  relatedProjectId: "project-567" // 如果任務屬於專案
}
```

### 5.6 專案

```javascript
project = {
  id: "project-567",
  title: "AI 管理天地開發",
  description: "開發一個整合 AI 的個人生活管理系統",
  status: "in-progress", // "planning", "in-progress", "on-hold", "completed"
  startDate: "2023-10-01T00:00:00Z",
  targetEndDate: "2023-12-31T23:59:59Z",
  actualEndDate: null,
  completionPercentage: 35,
  taskIds: ["task-789", "task-790", "task-791"], // 關聯的任務 IDs
  milestones: [
    {
      id: "milestone-1",
      title: "完成需求分析",
      dueDate: "2023-10-10T23:59:59Z",
      completed: true,
      completedAt: "2023-10-09T17:30:00Z"
    },
    {
      id: "milestone-2",
      title: "完成設計原型",
      dueDate: "2023-10-25T23:59:59Z",
      completed: false,
      completedAt: null
    }
    // 更多里程碑...
  ],
  kanbanColumns: [
    {
      id: "column-1",
      title: "待辦",
      taskIds: ["task-791"]
    },
    {
      id: "column-2",
      title: "進行中",
      taskIds: ["task-789", "task-790"]
    },
    {
      id: "column-3",
      title: "已完成",
      taskIds: []
    }
  ],
  tags: ["開發", "AI", "個人專案"],
  notes: "這是一個個人發展專案，目標是提升生產力和 AI 應用技能"
}
```

<a id="頁面結構與導航"></a>
## 6. 頁面結構與導航

### 6.1 主要佈局

應用程式採用側邊欄導航 + 內容區的經典佈局：

```
+-----------------------------------+
| 頂部標題欄                         |
+--------+--------------------------|
| 側邊欄  |                          |
| 導航選單 |      主要內容區域          |
|        |                          |
|        |                          |
|        |                          |
+--------+--------------------------+
```

### 6.2 導航結構

- **頂部標題欄**
  - 應用程式標題/Logo
  - 全域搜尋框
  - 使用者設定按鈕
  - 通知中心

- **側邊欄導航選單**
  - AI 聊天
  - 蕃茄鐘
  - 筆記本
  - 任務中心
  - 專案管理
  - 設定

### 6.3 各功能頁面結構

#### 6.3.1 AI 聊天頁面

```
+-----------------------------------+
| 對話列表 |                          |
|        |                          |
|        |       聊天內容區域          |
|        |                          |
|        |                          |
|        +--------------------------+
|        | 輸入區 | 發送 | 風格選擇       |
+--------+--------------------------+
```

#### 6.3.2 蕃茄鐘頁面

```
+-----------------------------------+
|                                   |
|           計時器顯示區               |
|                                   |
+-----------------------------------+
| 控制按鈕 | 目前任務顯示 | 設定          |
+-----------------------------------+
|                                   |
|           統計分析區域               |
|                                   |
+-----------------------------------+
```

#### 6.3.3 筆記本頁面

```
+--------+------------+-------------+
| 資料夾/ | 筆記列表    |              |
| 標籤列表 |            |              |
|        |            |   筆記編輯區   |
|        |            |              |
|        |            |              |
|        |            |              |
+--------+------------+-------------+
|                     | AI 洞察面板   |
+---------------------+-------------+
```

#### 6.3.4 任務中心頁面

```
+-----------------------------------+
| 任務總覽統計                        |
+-----------------------------------+
| 視圖選擇: 列表 | 日曆 | 四象限       |
+-----------------------------------+
|                                   |
|          主要任務視圖區域            |
|                                   |
|                                   |
+-----------------------------------+
| 任務詳情區 (點選任務時顯示)           |
+-----------------------------------+
```

#### 6.3.5 專案管理頁面

```
+-----------------------------------+
| 專案選擇下拉選單 | 視圖選擇按鈕        |
+-----------------------------------+
| 專案摘要 | 進度 | 里程碑概況          |
+-----------------------------------+
|                                   |
|   主要專案視圖區域（看板/甘特圖）      |
|                                   |
|                                   |
+-----------------------------------+
```

<a id="使用者介面設計"></a>
## 7. 使用者介面設計

### 7.1 色彩方案

多巴胺配色系統，創造愉悅且積極的使用體驗：

- **主色調**：#FF5A5F（珊瑚紅）- 用於主要行動按鈕、重要元素強調
- **次要色**：#FFB400（金黃色）- 用於次要按鈕、提示元素
- **輔助色**：#3A86FF（活力藍）- 用於連結、進度指示器
- **背景色**：
  - 主背景：#FFFFFF（純白）
  - 次要背景：#F8F9FA（淺灰）
  - 卡片背景：#FFFFFF（純白）
- **文字色**：
  - 主要文字：#333333（深灰）
  - 次要文字：#6C757D（中灰）
  - 提示文字：#AAAAAA（淺灰）
- **功能色**：
  - 成功：#28A745（綠色）
  - 警告：#FFC107（黃色）
  - 錯誤：#DC3545（紅色）
  - 資訊：#17A2B8（青色）
- **強調色**：#8A2BE2（紫色）- 用於特別重要的元素或 AI 相關功能

### 7.2 排版系統

- **字體家族**：
  - 主要字體：系統預設無襯線字體（蘋方、黑體等）
  - 等寬字體（程式碼）：等寬字體（SF Mono 等）

- **字體大小**：
  - 特大標題：24px
  - 大標題：20px
  - 中標題：18px
  - 小標題：16px
  - 正文：14px
  - 小文字：12px

- **字重**：
  - 粗體：600
  - 標準：400
  - 輕量：300

### 7.3 組件設計

#### 7.3.1 按鈕

- **主要按鈕**：
  - 背景色：#FF5A5F（主色調）
  - 文字色：#FFFFFF
  - 圓角：8px
  - 高度：40px
  - 內邊距：16px (左右)

- **次要按鈕**：
  - 背景色：#FFB400（次要色）
  - 文字色：#FFFFFF
  - 圓角：8px
  - 高度：40px
  - 內邊距：16px (左右)

- **文字按鈕**：
  - 背景色：透明
  - 文字色：#3A86FF（輔助色）
  - 無邊框
  - 高度：40px
  - 內邊距：8px (左右)

- **圖示按鈕**：
  - 背景色：透明
  - 圖示色：#6C757D（中灰）
  - 尺寸：40px x 40px
  - 圓角：20px

#### 7.3.2 輸入框

- **標準輸入框**：
  - 邊框：1px solid #DFE1E5
  - 背景色：#FFFFFF
  - 文字色：#333333
  - 圓角：8px
  - 高度：40px
  - 內邊距：12px (左右)

- **多行文本框**：
  - 邊框：1px solid #DFE1E5
  - 背景色：#FFFFFF
  - 文字色：#333333
  - 圓角：8px
  - 最小高度：100px
  - 內邊距：12px

- **搜尋框**：
  - 邊框：1px solid #DFE1E5
  - 背景色：#F8F9FA
  - 文字色：#333333
  - 圓角：20px
  - 高度：40px
  - 內邊距：12px (左) + 圖示

#### 7.3.3 卡片

- **標準卡片**：
  - 背景色：#FFFFFF
  - 陰影：0 2px 8px rgba(0, 0, 0, 0.08)
  - 圓角：12px
  - 內邊距：16px
  - 外邊距：16px (底部)

- **強調卡片**：
  - 背景色：#FFFFFF
  - 邊框：2px solid #FF5A5F（主色調）
  - 陰影：0 4px 12px rgba(0, 0, 0, 0.12)
  - 圓角：12px
  - 內邊距：16px
  - 外邊距：16px (底部)

#### 7.3.4 導航項目

- **側邊欄選單項**：
  - 高度：48px
  - 文字色：#333333
  - 活動狀態背景：#FFF0F0（主色調淡化）
  - 活動狀態文字色：#FF5A5F（主色調）
  - 左側圖示
  - 內邊距：16px

- **標籤頁**：
  - 高度：40px
  - 文字色：#6C757D（非活動）
  - 活動狀態文字色：#FF5A5F（主色調）
  - 活動狀態邊框底：2px solid #FF5A5F
  - 內邊距：16px (左右)

### 7.4 響應式設計指引

- **桌面版（≥1024px）**：
  - 側邊欄寬度：250px
  - 內容區域最大寬度：1200px
  - 兩欄/三欄佈局

- **平板版（768px-1023px）**：
  - 側邊欄寬度：200px
  - 內容區域縮放以適應
  - 可能從三欄切換為兩欄佈局

- **移動版（<768px）**：
  - 側邊欄轉為可隱藏選單
  - 單欄佈局
  - 元素垂直堆疊
  - 增大點擊區域（至少44px x 44px）

<a id="開發規劃"></a>
## 8. 開發規劃

### 8.1 前端技術棧詳細規格

- **框架**: React 18
  - 使用 TypeScript 提供類型安全性
  - 使用 Functional Components 和 Hooks
  - 使用 Context API 和 useReducer 進行狀態管理

- **狀態管理**: Redux Toolkit
  - 使用 createSlice 定義各功能模塊
  - 使用 thunk middleware 處理非同步操作
  - 使用 RTK Query 處理 API 請求

- **路由**: React Router 6
  - 配置巢狀路由結構
  - 使用 lazy loading 提升性能

- **樣式**: Tailwind CSS
  - 自定義主題配置符合設計規範
  - 使用 @apply 指令創建可重用樣式
  - 使用 responsive variants 實現響應式設計

- **其他庫**:
  - date-fns: 日期處理
  - react-markdown: Markdown 渲染
  - Chart.js & react-chartjs-2: 數據可視化
  - react-beautiful-dnd: 拖放功能
  - react-gantt-chart: 甘特圖

### 8.2 資料儲存方案

由於是純前端應用，將使用 localStorage 和 IndexedDB 進行資料儲存：

- **localStorage**:
  - 用於存儲使用者設定
  - 用於小型資料存儲
  - 大小限制 ~5MB

- **IndexedDB**:
  - 用於存儲大量結構化資料
  - 筆記、任務、專案等主要資料
  - 對話歷史記錄
  - 支援複雜查詢

### 8.3 AI 整合規格

- **Open Router API 整合**:
  - 使用 API Key 進行身份驗證
  - 支援的模型列表動態獲取
  - 請求和響應格式
  - 錯誤處理與重試機制

- **自訂風格系統**:
  - 風格定義格式
  - 風格套用機制
  - 風格管理與持久化

### 8.4 開發階段規劃

#### 第一階段：基礎架構搭建（1-2週）
1. 專案初始化與環境配置
2. 基礎 UI 組件開發
3. 路由結構實現
4. 狀態管理架構搭建
5. 資料儲存機制實現

#### 第二階段：核心功能開發（4-6週）
1. AI 聊天模塊開發
   - Open Router API 整合
   - 對話界面實現
   - 風格設定系統
2. 蕃茄鐘模塊開發
   - 計時器核心邏輯
   - 統計與分析功能
3. 筆記本模塊開發
   - Markdown 編輯器
   - 附件支援
   - AI 洞察整合
4. 任務中心模塊開發
   - 任務管理核心功能
   - 各種視圖實現
5. 專案管理模塊開發
   - 看板視圖
   - 甘特圖視圖
   - 里程碑管理

#### 第三階段：整合與優化（2-3週）
1. 模塊間整合與互通
2. 性能優化
3. 響應式設計完善
4. 本地化和輔助功能

#### 第四階段：測試與優化（1-2週）
1. 界面測試
2. 功能測試
3. 使用者體驗優化
4. 文檔與幫助內容

### 8.5 詳細開發任務清單

#### 8.5.1 專案初始化

1. 使用 Create React App 或 Vite 創建專案
   ```bash
   npx create-react-app ai-management-hub --template typescript
   # 或
   npm create vite@latest ai-management-hub -- --template react-ts
   ```

2. 安裝基礎依賴
   ```bash
   npm install react-router-dom @reduxjs/toolkit react-redux tailwindcss
   npm install date-fns react-markdown chart.js react-chartjs-2 react-beautiful-dnd
   ```

3. 配置 Tailwind CSS
   ```bash
   npx tailwindcss init -p
   ```

4. 配置路由結構
   ```tsx
   // src/App.tsx
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import Layout from './components/Layout';
   import AIChat from './pages/AIChat';
   import Pomodoro from './pages/Pomodoro';
   import Notebook from './pages/Notebook';
   import TaskCenter from './pages/TaskCenter';
   import ProjectManagement from './pages/ProjectManagement';
   import Settings from './pages/Settings';
   
   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<Layout />}>
             <Route index element={<AIChat />} />
             <Route path="pomodoro" element={<Pomodoro />} />
             <Route path="notebook" element={<Notebook />} />
             <Route path="tasks" element={<TaskCenter />} />
             <Route path="projects" element={<ProjectManagement />} />
             <Route path="settings" element={<Settings />} />
           </Route>
         </Routes>
       </BrowserRouter>
     );
   }
   
   export default App;
   ```

#### 8.5.2 UI 組件庫開發

1. 按鈕組件
   ```tsx
   // src/components/ui/Button.tsx
   import React from 'react';
   
   type ButtonVariant = 'primary' | 'secondary' | 'text' | 'icon';
   
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: ButtonVariant;
     children: React.ReactNode;
     className?: string;
   }
   
   const Button: React.FC<ButtonProps> = ({ 
     variant = 'primary', 
     children, 
     className = '',
     ...props 
   }) => {
     const baseClasses = 'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
     
     const variantClasses = {
       primary: 'bg-[#FF5A5F] hover:bg-[#FF7A7F] text-white rounded-lg h-10 px-4 focus:ring-[#FF5A5F]/50',
       secondary: 'bg-[#FFB400] hover:bg-[#FFC430] text-white rounded-lg h-10 px-4 focus:ring-[#FFB400]/50',
       text: 'bg-transparent text-[#3A86FF] hover:text-[#0A66FF] h-10 px-2 focus:ring-[#3A86FF]/50',
       icon: 'bg-transparent text-[#6C757D] hover:text-[#333333] h-10 w-10 rounded-full flex items-center justify-center focus:ring-[#6C757D]/50'
     };
     
     return (
       <button
         className={`${baseClasses} ${variantClasses[variant]} ${className}`}
         {...props}
       >
         {children}
       </button>
     );
   };
   
   export default Button;
   ```

2. 輸入框組件
   ```tsx
   // src/components/ui/Input.tsx
   import React from 'react';
   
   interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
     label?: string;
     error?: string;
     className?: string;
   }
   
   const Input: React.FC<InputProps> = ({ 
     label, 
     error, 
     className = '',
     ...props 
   }) => {
     return (
       <div className="w-full">
         {label && (
           <label className="block text-sm font-medium text-[#333333] mb-1">
             {label}
           </label>
         )}
         <input
           className={`w-full h-10 px-3 border border-[#DFE1E5] rounded-lg text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/50 focus:border-transparent ${error ? 'border-[#DC3545]' : ''} ${className}`}
           {...props}
         />
         {error && (
           <p className="mt-1 text-sm text-[#DC3545]">{error}</p>
         )}
       </div>
     );
   };
   
   export default Input;
   ```

3. 卡片組件
   ```tsx
   // src/components/ui/Card.tsx
   import React from 'react';
   
   interface CardProps {
     children: React.ReactNode;
     emphasized?: boolean;
     className?: string;
   }
   
   const Card: React.FC<CardProps> = ({ 
     children, 
     emphasized = false, 
     className = '' 
   }) => {
     const baseClasses = 'bg-white rounded-xl p-4 mb-4';
     const emphasizedClasses = emphasized 
       ? 'border-2 border-[#FF5A5F] shadow-lg' 
       : 'shadow-md';
     
     return (
       <div className={`${baseClasses} ${emphasizedClasses} ${className}`}>
         {children}
       </div>
     );
   };
   
   export default Card;
   ```

#### 8.5.3 AI 聊天模塊開發

1. AI 聊天頁面結構
   ```tsx
   // src/pages/AIChat.tsx
   import React, { useState, useEffect } from 'react';
   import ConversationList from '../components/chat/ConversationList';
   import ChatWindow from '../components/chat/ChatWindow';
   import ChatInput from '../components/chat/ChatInput';
   import StyleSelector from '../components/chat/StyleSelector';
   import { useAppSelector, useAppDispatch } from '../app/hooks';
   import { fetchConversations, selectActiveConversation } from '../features/chat/chatSlice';
   
   const AIChat: React.FC = () => {
     const dispatch = useAppDispatch();
     const conversations = useAppSelector(state => state.chat.conversations);
     const activeConversation = useAppSelector(state => state.chat.activeConversation);
     
     useEffect(() => {
       dispatch(fetchConversations());
     }, [dispatch]);
     
     return (
       <div className="flex h-full">
         <div className="w-1/4 border-r border-[#DFE1E5] p-4">
           <ConversationList 
             conversations={conversations}
             activeId={activeConversation?.id}
             onSelect={(id) => dispatch(selectActiveConversation(id))}
           />
         </div>
         <div className="w-3/4 flex flex-col h-full">
           <div className="flex-grow overflow-auto p-4">
             {activeConversation ? (
               <ChatWindow conversation={activeConversation} />
             ) : (
               <div className="h-full flex items-center justify-center">
                 <p className="text-[#6C757D]">選擇或開始一個新對話</p>
               </div>
             )}
           </div>
           <div className="border-t border-[#DFE1E5] p-4 flex items-end">
             <ChatInput 
               onSend={(message) => {/* 發送訊息邏輯 */}}
               disabled={!activeConversation}
             />
             <StyleSelector />
           </div>
         </div>
       </div>
     );
   };
   
   export default AIChat;
   ```

2. AI 模型整合
   ```tsx
   // src/services/aiService.ts
   import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
   
   interface ChatMessage {
     role: 'user' | 'assistant' | 'system';
     content: string;
   }
   
   interface ChatCompletionRequest {
     model: string;
     messages: ChatMessage[];
     temperature?: number;
     max_tokens?: number;
   }
   
   interface ChatCompletionResponse {
     id: string;
     choices: {
       message: {
         role: string;
         content: string;
       };
     }[];
   }
   
   export const aiApi = createApi({
     reducerPath: 'aiApi',
     baseQuery: fetchBaseQuery({ 
       baseUrl: 'https://openrouter.ai/api/v1/',
       prepareHeaders: (headers) => {
         const apiKey = localStorage.getItem('openRouterApiKey');
         if (apiKey) {
           headers.set('authorization', `Bearer ${apiKey}`);
         }
         return headers;
       }
     }),
     endpoints: (builder) => ({
       getModels: builder.query({
         query: () => 'models',
       }),
       createChatCompletion: builder.mutation<ChatCompletionResponse, ChatCompletionRequest>({
         query: (body) => ({
           url: 'chat/completions',
           method: 'POST',
           body,
         }),
       }),
     }),
   });
   
   export const { 
     useGetModelsQuery, 
     useCreateChatCompletionMutation 
   } = aiApi;
   ```

#### 8.5.4 蕃茄鐘模塊開發

1. 蕃茄鐘頁面結構
   ```tsx
   // src/pages/Pomodoro.tsx
   import React, { useState, useEffect } from 'react';
   import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
   import PomodoroControls from '../components/pomodoro/PomodoroControls';
   import TaskSelector from '../components/pomodoro/TaskSelector';
   import PomodoroStats from '../components/pomodoro/PomodoroStats';
   import { useAppSelector, useAppDispatch } from '../app/hooks';
   import { 
     startTimer, 
     pauseTimer, 
     resetTimer, 
     skipTimer,
     recordInterruption
   } from '../features/pomodoro/pomodoroSlice';
   
   const Pomodoro: React.FC = () => {
     const dispatch = useAppDispatch();
     const {
       isActive,
       mode,
       timeLeft,
       workDuration,
       shortBreakDuration,
       longBreakDuration,
       completedPomodoros,
       currentSession
     } = useAppSelector(state => state.pomodoro);
     
     // 處理通知和聲音
     useEffect(() => {
       if (timeLeft === 0) {
         const nextMode = mode === 'work' ? 'break' : 'work';
         const notification = new Notification(
           `${nextMode === 'work' ? '休息時間結束' : '工作時間結束'}`,
           { body: `該開始${nextMode === 'work' ? '工作' : '休息'}了` }
         );
         
         // 播放聲音
         const sound = new Audio('/sounds/bell.mp3');
         sound.play();
       }
     }, [timeLeft, mode]);
     
     return (
       <div className="max-w-2xl mx-auto p-4">
         <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
           <PomodoroTimer 
             timeLeft={timeLeft}
             mode={mode}
             isActive={isActive}
           />
           
           <PomodoroControls 
             isActive={isActive}
             onStart={() => dispatch(startTimer())}
             onPause={() => dispatch(pauseTimer())}
             onReset={() => dispatch(resetTimer())}
             onSkip={() => dispatch(skipTimer())}
             onInterruption={(reason) => dispatch(recordInterruption(reason))}
           />
           
           <TaskSelector />
         </div>
         
         <PomodoroStats 
           currentSession={currentSession}
           completedPomodoros={completedPomodoros}
         />
       </div>
     );
   };
   
   export default Pomodoro;
   ```

2. 蕃茄鐘計時器組件
   ```tsx
   // src/components/pomodoro/PomodoroTimer.tsx
   import React from 'react';
   
   interface PomodoroTimerProps {
     timeLeft: number;
     mode: 'work' | 'shortBreak' | 'longBreak';
     isActive: boolean;
   }
   
   const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ 
     timeLeft, 
     mode, 
     isActive 
   }) => {
     // 格式化時間
     const formatTime = (seconds: number): string => {
       const mins = Math.floor(seconds / 60);
       const secs = seconds % 60;
       return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
     };
     
     // 計算圓環進度
     const calculateProgress = (current: number, total: number): number => {
       return (1 - current / total) * 100;
     };
     
     // 根據模式獲取顏色
     const getColorByMode = (): string => {
       switch (mode) {
         case 'work':
           return '#FF5A5F';
         case 'shortBreak':
           return '#3A86FF';
         case 'longBreak':
           return '#28A745';
         default:
           return '#FF5A5F';
       }
     };
     
     const getModeText = (): string => {
       switch (mode) {
         case 'work':
           return '專注工作';
         case 'shortBreak':
           return '短休息';
         case 'longBreak':
           return '長休息';
         default:
           return '專注工作';
       }
     };
     
     // 獲取總時間（用於計算進度）
     const getTotalTime = (): number => {
       switch (mode) {
         case 'work':
           return 25 * 60; // 25分鐘
         case 'shortBreak':
           return 5 * 60;  // 5分鐘
         case 'longBreak':
           return 15 * 60; // 15分鐘
         default:
           return 25 * 60;
       }
     };
     
     const progress = calculateProgress(timeLeft, getTotalTime());
     const color = getColorByMode();
     
     return (
       <div className="relative w-64 h-64 mx-auto mb-8">
         {/* 進度環 */}
         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
           {/* 背景環 */}
           <circle
             cx="50"
             cy="50"
             r="45"
             fill="none"
             stroke="#F0F0F0"
             strokeWidth="8"
           />
           {/* 進度環 */}
           <circle
             cx="50"
             cy="50"
             r="45"
             fill="none"
             stroke={color}
             strokeWidth="8"
             strokeDasharray="283"
             strokeDashoffset={283 - (283 * progress) / 100}
             strokeLinecap="round"
           />
         </svg>
         
         {/* 時間文字 */}
         <div className="absolute inset-0 flex flex-col items-center justify-center">
           <div className="text-4xl font-bold text-[#333333]">
             {formatTime(timeLeft)}
           </div>
           <div className="text-sm font-medium text-[#6C757D] mt-2">
             {getModeText()}
           </div>
           <div className="text-xs text-[#AAAAAA] mt-1">
             {isActive ? '進行中' : '已暫停'}
           </div>
         </div>
       </div>
     );
   };
   
   export default PomodoroTimer;
   ```

#### 8.5.5 筆記本模塊開發

1. 筆記本頁面結構
   ```tsx
   // src/pages/Notebook.tsx
   import React, { useState, useEffect } from 'react';
   import FolderList from '../components/notebook/FolderList';
   import NoteList from '../components/notebook/NoteList';
   import NoteEditor from '../components/notebook/NoteEditor';
   import AIInsightPanel from '../components/notebook/AIInsightPanel';
   import { useAppSelector, useAppDispatch } from '../app/hooks';
   import { 
     fetchFolders, 
     fetchNotes, 
     selectNote,
     createNote,
     updateNote,
     deleteNote
   } from '../features/notebook/notebookSlice';
   
   const Notebook: React.FC = () => {
     const dispatch = useAppDispatch();
     const {
       folders,
       notes,
       activeNote,
       activeFolder,
       isLoading
     } = useAppSelector(state => state.notebook);
     
     const [showInsightPanel, setShowInsightPanel] = useState(false);
     
     useEffect(() => {
       dispatch(fetchFolders());
     }, [dispatch]);
     
     useEffect(() => {
       if (activeFolder) {
         dispatch(fetchNotes(activeFolder.id));
       }
     }, [dispatch, activeFolder]);
     
     const handleSelectNote = (noteId: string) => {
       dispatch(selectNote(noteId));
     };
     
     const handleCreateNote = () => {
       if (activeFolder) {
         dispatch(createNote({ folderId: activeFolder.id }));
       }
     };
     
     const handleUpdateNote = (content: string) => {
       if (activeNote) {
         dispatch(updateNote({ id: activeNote.id, content }));
       }
     };
     
     const toggleInsightPanel = () => {
       setShowInsightPanel(!showInsightPanel);
     };
     
     return (
       <div className="flex h-full">
         {/* 資料夾列表 */}
         <div className="w-1/6 border-r border-[#DFE1E5] p-4">
           <FolderList 
             folders={folders} 
             activeId={activeFolder?.id}
           />
         </div>
         
         {/* 筆記列表 */}
         <div className="w-1/4 border-r border-[#DFE1E5] p-4">
           <NoteList 
             notes={notes}
             activeId={activeNote?.id}
             onSelect={handleSelectNote}
             onCreate={handleCreateNote}
           />
         </div>
         
         {/* 筆記編輯區域 */}
         <div className={`${showInsightPanel ? 'w-2/5' : 'w-7/12'} flex flex-col h-full`}>
           {activeNote ? (
             <NoteEditor 
               note={activeNote}
               onChange={handleUpdateNote}
               onToggleInsight={toggleInsightPanel}
             />
           ) : (
             <div className="h-full flex items-center justify-center">
               <p className="text-[#6C757D]">選擇或建立一個新筆記</p>
             </div>
           )}
         </div>
         
         {/* AI 洞察面板 */}
         {showInsightPanel && activeNote && (
           <div className="w-1/4 border-l border-[#DFE1E5] p-4">
             <AIInsightPanel note={activeNote} />
           </div>
         )}
       </div>
     );
   };
   
   export default Notebook;
   ```

2. 筆記編輯器組件
   ```tsx
   // src/components/notebook/NoteEditor.tsx
   import React, { useState, useEffect } from 'react';
   import ReactMarkdown from 'react-markdown';
   import Button from '../ui/Button';
   import { Note } from '../../types';
   
   interface NoteEditorProps {
     note: Note;
     onChange: (content: string) => void;
     onToggleInsight: () => void;
   }
   
   const NoteEditor: React.FC<NoteEditorProps> = ({ 
     note, 
     onChange, 
     onToggleInsight 
   }) => {
     const [isEditMode, setIsEditMode] = useState(true);
     const [content, setContent] = useState(note.content);
     const [selectedText, setSelectedText] = useState('');
     
     useEffect(() => {
       setContent(note.content);
     }, [note.id, note.content]);
     
     const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
       setContent(e.target.value);
       onChange(e.target.value);
     };
     
     const handleModeToggle = () => {
       setIsEditMode(!isEditMode);
     };
     
     const handleTextSelect = () => {
       const selection = window.getSelection();
       if (selection && selection.toString()) {
         setSelectedText(selection.toString());
       }
     };
     
     const handleRequestInsight = () => {
       // 打開洞察面板
       onToggleInsight();
     };
     
     return (
       <div className="h-full flex flex-col">
         <div className="flex items-center justify-between p-4 border-b border-[#DFE1E5]">
           <input
             type="text"
             value={note.title}
             className="text-xl font-semibold border-none focus:outline-none focus:ring-0 w-2/3"
             placeholder="無標題筆記"
             onChange={(e) => onChange({ ...note, title: e.target.value })}
           />
           <div className="flex items-center space-x-2">
             <Button
               variant="text"
               onClick={handleModeToggle}
             >
               {isEditMode ? '預覽' : '編輯'}
             </Button>
             <Button
               variant="primary"
               onClick={handleRequestInsight}
               disabled={!content}
             >
               AI 洞察
             </Button>
           </div>
         </div>
         
         <div className="flex-grow overflow-auto p-4">
           {isEditMode ? (
             <textarea
               className="w-full h-full p-2 border border-[#DFE1E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/50 focus:border-transparent resize-none"
               value={content}
               onChange={handleTextChange}
               onMouseUp={handleTextSelect}
               placeholder="開始撰寫你的筆記..."
             />
           ) : (
             <div className="prose max-w-none">
               <ReactMarkdown>{content}</ReactMarkdown>
             </div>
           )}
         </div>
       </div>
     );
   };
   
   export default NoteEditor;
   ```

#### 8.5.6 任務中心模塊開發

1. 任務中心頁面結構
   ```tsx
   // src/pages/TaskCenter.tsx
   import React, { useState, useEffect } from 'react';
   import TaskOverview from '../components/tasks/TaskOverview';
   import TaskViewSelector from '../components/tasks/TaskViewSelector';
   import TaskListView from '../components/tasks/TaskListView';
   import TaskCalendarView from '../components/tasks/TaskCalendarView';
   import TaskQuadrantView from '../components/tasks/TaskQuadrantView';
   import TaskDetail from '../components/tasks/TaskDetail';
   import { useAppSelector, useAppDispatch } from '../app/hooks';
   import { 
     fetchTasks, 
     selectTask,
     createTask,
     updateTask,
     deleteTask
   } from '../features/tasks/tasksSlice';
   
   type TaskView = 'list' | 'calendar' | 'quadrant';
   
   const TaskCenter: React.FC = () => {
     const dispatch = useAppDispatch();
     const {
       tasks,
       activeTask,
       isLoading
     } = useAppSelector(state => state.tasks);
     
     const [currentView, setCurrentView] = useState<TaskView>('list');
     const [showTaskDetail, setShowTaskDetail] = useState(false);
     
     useEffect(() => {
       dispatch(fetchTasks());
     }, [dispatch]);
     
     useEffect(() => {
       if (activeTask) {
         setShowTaskDetail(true);
       }
     }, [activeTask]);
     
     const handleViewChange = (view: TaskView) => {
       setCurrentView(view);
     };
     
     const handleSelectTask = (taskId: string) => {
       dispatch(selectTask(taskId));
     };
     
     const handleCreateTask = () => {
       dispatch(createTask());
     };
     
     const handleCloseTaskDetail = () => {
       setShowTaskDetail(false);
     };
     
     const renderTaskView = () => {
       switch (currentView) {
         case 'list':
           return (
             <TaskListView 
               tasks={tasks}
               activeId={activeTask?.id}
               onSelect={handleSelectTask}
               onCreate={handleCreateTask}
             />
           );
         case 'calendar':
           return (
             <TaskCalendarView 
               tasks={tasks}
               onSelect={handleSelectTask}
               onCreate={handleCreateTask}
             />
           );
         case 'quadrant':
           return (
             <TaskQuadrantView 
               tasks={tasks}
               onSelect={handleSelectTask}
               onCreate={handleCreateTask}
             />
           );
         default:
           return null;
       }
     };
     
     return (
       <div className="flex flex-col h-full">
         <TaskOverview tasks={tasks} />
         
         <TaskViewSelector 
           currentView={currentView} 
           onChange={handleViewChange} 
         />
         
         <div className="flex-grow overflow-auto">
           {renderTaskView()}
         </div>
         
         {showTaskDetail && activeTask && (
           <div className="border-t border-[#DFE1E5]">
             <TaskDetail 
               task={activeTask}
               onClose={handleCloseTaskDetail}
               onUpdate={(updatedTask) => dispatch(updateTask(updatedTask))}
             />
           </div>
         )}
       </div>
     );
   };
   
   export default TaskCenter;
   ```

2. 四象限視圖組件
   ```tsx
   // src/components/tasks/TaskQuadrantView.tsx
   import React from 'react';
   import Card from '../ui/Card';
   import Button from '../ui/Button';
   import { Task } from '../../types';
   
   interface TaskQuadrantViewProps {
     tasks: Task[];
     onSelect: (taskId: string) => void;
     onCreate: () => void;
   }
   
   const TaskQuadrantView: React.FC<TaskQuadrantViewProps> = ({ 
     tasks, 
     onSelect, 
     onCreate 
   }) => {
     // 按象限分類任務
     const quadrantTasks = {
       'important-urgent': tasks.filter(task => task.quadrant === 'important-urgent'),
       'important-not-urgent': tasks.filter(task => task.quadrant === 'important-not-urgent'),
       'not-important-urgent': tasks.filter(task => task.quadrant === 'not-important-urgent'),
       'not-important-not-urgent': tasks.filter(task => task.quadrant === 'not-important-not-urgent')
     };
     
     const renderTaskCard = (task: Task) => (
       <div 
         key={task.id}
         className="bg-white rounded-lg shadow-sm p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
         onClick={() => onSelect(task.id)}
       >
         <div className="flex items-start">
           <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${
             task.priority === 'high' ? 'bg-[#DC3545]' : 
             task.priority === 'medium' ? 'bg-[#FFC107]' : 
             'bg-[#28A745]'
           }`} />
           <div className="flex-grow">
             <h4 className="font-medium text-[#333333] line-clamp-2">{task.title}</h4>
             {task.dueDate && (
               <p className="text-xs text-[#6C757D] mt-1">
                 截止: {new Date(task.dueDate).toLocaleDateString('zh-TW')}
               </p>
             )}
           </div>
         </div>
       </div>
     );
     
     return (
       <div className="p-4">
         <div className="flex justify-end mb-4">
           <Button variant="primary" onClick={onCreate}>
             新增任務
           </Button>
         </div>
         
         <div className="grid grid-cols-2 gap-4 h-[calc(100vh-240px)]">
           {/* 第一象限: 重要且緊急 */}
           <div className="bg-[#FFF0F0] rounded-xl p-4 overflow-auto">
             <h3 className="font-bold text-lg text-[#FF5A5F] mb-4">重要且緊急</h3>
             {quadrantTasks['important-urgent'].map(renderTaskCard)}
           </div>
           
           {/* 第二象限: 重要但不緊急 */}
           <div className="bg-[#FFF8E1] rounded-xl p-4 overflow-auto">
             <h3 className="font-bold text-lg text-[#FFB400] mb-4">重要但不緊急</h3>
             {quadrantTasks['important-not-urgent'].map(renderTaskCard)}
           </div>
           
           {/* 第三象限: 不重要但緊急 */}
           <div className="bg-[#E1F5FE] rounded-xl p-4 overflow-auto">
             <h3 className="font-bold text-lg text-[#3A86FF] mb-4">不重要但緊急</h3>
             {quadrantTasks['not-important-urgent'].map(renderTaskCard)}
           </div>
           
           {/* 第四象限: 不重要且不緊急 */}
           <div className="bg-[#F5F5F5] rounded-xl p-4 overflow-auto">
             <h3 className="font-bold text-lg text-[#6C757D] mb-4">不重要且不緊急</h3>
             {quadrantTasks['not-important-not-urgent'].map(renderTaskCard)}
           </div>
         </div>
       </div>
     );
   };
   
   export default TaskQuadrantView;
   ```

#### 8.5.7 專案管理模塊開發

1. 專案管理頁面結構
   ```tsx
   // src/pages/ProjectManagement.tsx
   import React, { useState, useEffect } from 'react';
   import ProjectSelector from '../components/projects/ProjectSelector';
   import ProjectViewSelector from '../components/projects/ProjectViewSelector';
   import ProjectSummary from '../components/projects/ProjectSummary';
   import KanbanView from '../components/projects/KanbanView';
   import GanttView from '../components/projects/GanttView';
   import MilestoneView from '../components/projects/MilestoneView';
   import { useAppSelector, useAppDispatch } from '../app/hooks';
   import { 
     fetchProjects, 
     selectProject,
     createProject,
     updateProject,
     deleteProject
   } from '../features/projects/projectsSlice';
   
   type ProjectView = 'kanban' | 'gantt' | 'milestone';
   
   const ProjectManagement: React.FC = () => {
     const dispatch = useAppDispatch();
     const {
       projects,
       activeProject,
       isLoading
     } = useAppSelector(state => state.projects);
     
     const [currentView, setCurrentView] = useState<ProjectView>('kanban');
     
     useEffect(() => {
       dispatch(fetchProjects());
     }, [dispatch]);
     
     const handleViewChange = (view: ProjectView) => {
       setCurrentView(view);
     };
     
     const handleSelectProject = (projectId: string) => {
       dispatch(selectProject(projectId));
     };
     
     const handleCreateProject = () => {
       dispatch(createProject());
     };
     
     const renderProjectView = () => {
       if (!activeProject) return null;
       
       switch (currentView) {
         case 'kanban':
           return <KanbanView project={activeProject} />;
         case 'gantt':
           return <GanttView project={activeProject} />;
         case 'milestone':
           return <MilestoneView project={activeProject} />;
         default:
           return null;
       }
     };
     
     return (
       <div className="flex flex-col h-full">
         <div className="flex items-center justify-between p-4 border-b border-[#DFE1E5]">
           <ProjectSelector 
             projects={projects}
             activeId={activeProject?.id}
             onSelect={handleSelectProject}
             onCreate={handleCreateProject}
           />
           
           <ProjectViewSelector 
             currentView={currentView} 
             onChange={handleViewChange} 
           />
         </div>
         
         {activeProject ? (
           <>
             <ProjectSummary project={activeProject} />
             
             <div className="flex-grow overflow-auto">
               {renderProjectView()}
             </div>
           </>
         ) : (
           <div className="h-full flex items-center justify-center">
             <p className="text-[#6C757D]">選擇或建立一個新專案</p>
           </div>
         )}
       </div>
     );
   };
   
   export default ProjectManagement;
   ```

2. 看板視圖組件
   ```tsx
   // src/components/projects/KanbanView.tsx
   import React from 'react';
   import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
   import Card from '../ui/Card';
   import Button from '../ui/Button';
   import { Project, Task } from '../../types';
   import { useAppDispatch } from '../../app/hooks';
   import { updateProject } from '../../features/projects/projectsSlice';
   
   interface KanbanViewProps {
     project: Project;
   }
   
   const KanbanView: React.FC<KanbanViewProps> = ({ project }) => {
     const dispatch = useAppDispatch();
     
     const handleDragEnd = (result: any) => {
       const { source, destination } = result;
       
       // 拖放被取消或拖放到相同位置
       if (!destination || 
           (source.droppableId === destination.droppableId && 
            source.index === destination.index)) {
         return;
       }
       
       // 創建看板欄位的副本
       const newColumns = [...project.kanbanColumns];
       
       // 找到源欄位和目標欄位
       const sourceColumn = newColumns.find(col => col.id === source.droppableId);
       const destColumn = newColumns.find(col => col.id === destination.droppableId);
       
       if (!sourceColumn || !destColumn) return;
       
       // 移動任務 ID
       const taskId = sourceColumn.taskIds[source.index];
       sourceColumn.taskIds.splice(source.index, 1);
       destColumn.taskIds.splice(destination.index, 0, taskId);
       
       // 更新專案
       dispatch(updateProject({
         ...project,
         kanbanColumns: newColumns
       }));
     };
     
     return (
       <DragDropContext onDragEnd={handleDragEnd}>
         <div className="p-4 flex space-x-4 h-[calc(100vh-240px)]">
           {project.kanbanColumns.map(column => (
             <div 
               key={column.id}
               className="bg-[#F8F9FA] rounded-xl p-4 w-80 flex-shrink-0"
             >
               <h3 className="font-bold text-lg text-[#333333] mb-4">
                 {column.title}
               </h3>
               
               <Droppable droppableId={column.id}>
                 {(provided) => (
                   <div
                     ref={provided.innerRef}
                     {...provided.droppableProps}
                     className="h-full overflow-auto"
                   >
                     {column.taskIds.map((taskId, index) => {
                       const task = project.tasks.find(t => t.id === taskId);
                       if (!task) return null;
                       
                       return (
                         <Draggable 
                           key={taskId}
                           draggableId={taskId}
                           index={index}
                         >
                           {(provided) => (
                             <div
                               ref={provided.innerRef}
                               {...provided.draggableProps}
                               {...provided.dragHandleProps}
                               className="mb-2"
                             >
                               <Card>
                                 <h4 className="font-medium text-[#333333]">{task.title}</h4>
                                 {task.dueDate && (
                                   <p className="text-xs text-[#6C757D] mt-1">
                                     截止: {new Date(task.dueDate).toLocaleDateString('zh-TW')}
                                   </p>
                                 )}
                                 {task.completionPercentage > 0 && (
                                   <div className="mt-2">
                                     <div className="w-full bg-[#F0F0F0] rounded-full h-1.5">
                                       <div 
                                         className="bg-[#3A86FF] h-1.5 rounded-full"
                                         style={{ width: `${task.completionPercentage}%` }}
                                       />
                                     </div>
                                     <p className="text-xs text-right text-[#6C757D] mt-1">
                                       {task.completionPercentage}%
                                     </p>
                                   </div>
                                 )}
                               </Card>
                             </div>
                           )}
                         </Draggable>
                       );
                     })}
                     {provided.placeholder}
                   </div>
                 )}
               </Droppable>
               
               <Button 
                 variant="text"
                 className="mt-4 w-full justify-center"
                 onClick={() => {/* 新增任務 */}}
               >
                 + 新增任務
               </Button>
             </div>
           ))}
         </div>
       </DragDropContext>
     );
   };
   
   export default KanbanView;
   ```

<a id="附錄api-規格"></a>
## 9. 附錄：API 規格

### 9.1 Open Router API

#### 9.1.1 聊天完成（Chat Completion）

**請求 URL**: `https://openrouter.ai/api/v1/chat/completions`

**方法**: `POST`

**請求標頭**:
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**請求體**:
```json
{
  "model": "anthropic/claude-2",
  "messages": [
    {
      "role": "system",
      "content": "你是一個極簡風格的助手，提供簡潔明了的回應，避免冗長解釋。"
    },
    {
      "role": "user",
      "content": "如何提高工作效率？"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**響應**:
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "anthropic/claude-2",
  "usage": {
    "prompt_tokens": 40,
    "completion_tokens": 80,
    "total_tokens": 120
  },
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "提高工作效率的三個方法：\n1. 使用蕃茄鐘技術\n2. 消除分心源\n3. 批次處理類似任務"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ]
}
```

#### 9.1.2 獲取可用模型

**請求 URL**: `https://openrouter.ai/api/v1/models`

**方法**: `GET`

**請求標頭**:
```
Authorization: Bearer YOUR_API_KEY
```

**響應**:
```json
{
  "data": [
    {
      "id": "anthropic/claude-2",
      "name": "Claude 2",
      "description": "Anthropic's most capable model"
    },
    {
      "id": "openai/gpt-4",
      "name": "GPT-4",
      "description": "OpenAI's most capable model"
    }
  ]
}
```

### 9.2 IndexedDB 架構

#### 9.2.1 資料庫初始化

```javascript
// src/services/db.ts
const dbPromise = openDB('AIManagementHub', 1, {
  upgrade(db) {
    // 使用者設定存儲
    db.createObjectStore('settings', { keyPath: 'id' });
    
    // 對話存儲
    const conversationsStore = db.createObjectStore('conversations', { keyPath: 'id' });
    conversationsStore.createIndex('updatedAt', 'updatedAt');
    
    // 蕃茄鐘記錄存儲
    const pomodoroStore = db.createObjectStore('pomodoros', { keyPath: 'id' });
    pomodoroStore.createIndex('startTime', 'startTime');
    
    // 筆記存儲
    const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
    notesStore.createIndex('folderId', 'folderId');
    notesStore.createIndex('updatedAt', 'updatedAt');
    
    // 筆記資料夾存儲
    db.createObjectStore('noteFolders', { keyPath: 'id' });
    
    // 任務存儲
    const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
    tasksStore.createIndex('status', 'status');
    tasksStore.createIndex('dueDate', 'dueDate');
    
    // 專案存儲
    const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
    projectsStore.createIndex('status', 'status');
  }
});
```

#### 9.2.2 資料存取服務

```javascript
// src/services/dataService.ts
import { dbPromise } from './db';

// 通用 CRUD 操作
export async function getItem(store, id) {
  return (await dbPromise).get(store, id);
}

export async function getAllItems(store) {
  return (await dbPromise).getAll(store);
}

export async function setItem(store, item) {
  return (await dbPromise).put(store, item);
}

export async function deleteItem(store, id) {
  return (await dbPromise).delete(store, id);
}

// 特定查詢
export async function getNotesByFolder(folderId) {
  return (await dbPromise).getAllFromIndex('notes', 'folderId', folderId);
}

export async function getTasksByStatus(status) {
  return (await dbPromise).getAllFromIndex('tasks', 'status', status);
}

export async function getRecentConversations(limit = 10) {
  const db = await dbPromise;
  const tx = db.transaction('conversations', 'readonly');
  const index = tx.store.index('updatedAt');
  
  let cursor = await index.openCursor(null, 'prev');
  const conversations = [];
  
  while (cursor && conversations.length < limit) {
    conversations.push(cursor.value);
    cursor = await cursor.continue();
  }
  
  return conversations;
}
```

此規格書提供了「AI 管理天地」網頁應用程式的全面設計與開發指南。從產品概述到具體的程式碼實現，這份文檔涵蓋了所有需要的技術細節，可作為開發團隊的完整參考。採用多巴胺配色系統和蘋果極簡設計風格，應用程式將提供清晰、愉悅的使用者體驗。每個功能模組（AI 聊天、蕃茄鐘、筆記本、任務中心、專案管理）均有詳細的設計規範，確保整體體驗的一致性和高品質。開發人員可以直接參照程式碼示例和資料結構定義，快速實現各項功能。

