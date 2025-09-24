# Git 操作指南 - AI管理Hub專案

## 🎯 版本管理策略

### 分支模型
```
master (主分支) - 穩定版本
├── develop (開發分支) - 功能整合
├── feature/* (功能分支) - 新功能開發
├── hotfix/* (熱修復分支) - 緊急修復
└── release/* (發佈分支) - 版本準備
```

## 🚀 常用操作指令

### 1. 基本操作
```bash
# 查看狀態
git status

# 查看歷史
git log --oneline -10

# 查看分支
git branch -a
```

### 2. 功能開發流程
```bash
# 創建新功能分支
git checkout -b feature/新功能名稱

# 開發完成後
git add .
git commit -m "✨ 添加新功能：具體描述"

# 切回master並合併
git checkout master
git merge feature/新功能名稱

# 推播到遠端
git push origin master
```

### 3. 版本回退操作
```bash
# 查看歷史版本
git log --oneline

# 回退到指定版本（軟回退，保留修改）
git reset --soft HEAD~1

# 回退到指定版本（硬回退，刪除修改）
git reset --hard 版本號

# 查看遠端版本
git reflog
```

### 4. 分支管理
```bash
# 創建開發分支
git checkout -b develop

# 推送新分支到遠端
git push -u origin develop

# 刪除本地分支
git branch -d 分支名稱

# 刪除遠端分支
git push origin --delete 分支名稱
```

## 📋 提交訊息規範

### 格式
```
🎯 類型: 簡短描述

詳細說明（可選）

- ✅ 完成的任務1
- ✅ 完成的任務2
- 🔧 修復的問題
```

### 類型說明
- 🎉 **feat**: 新功能
- 🔧 **fix**: 修復錯誤
- 📚 **docs**: 文檔更新
- 💄 **style**: 樣式修改
- 🔨 **refactor**: 代碼重構
- ⚡ **perf**: 性能優化
- 🧪 **test**: 測試相關
- 🔨 **chore**: 構建/工具

## 🔄 版本回復操作

### 回到三個版本前
git reset --soft HEAD~3

### 恢復特定文件
git checkout 版本號 -- 文件路徑

### 創建備份分支後回退
git checkout -b backup/版本備份
git checkout master
git reset --hard HEAD~3
```

## 🚨 緊急操作

### 誤提交恢復
git reset --soft HEAD~1  # 撤銷最後一次提交

### 強制推播（謹慎使用）
git push origin master --force

### 遠端覆蓋本地
git fetch origin
git reset --hard origin/master

