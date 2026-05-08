# thePet — 宠物档案记录与上门喂养多端应用

## 项目简介

thePet 是一款以**宠物档案记录与展示**为核心，**上门喂养、在线沟通**为附加功能的轻量化多端应用。支持微信小程序、Android APP、iOS APP 三端统一，配套独立管理后台。

### 核心功能

- 🐾 **多宠物档案管理** — 无限数量宠物，独立档案数据隔离，支持封存
- 📸 **宠物相册** — 单宠物专属相册，图片/视频上传，服务对比图自动归类
- 📝 **成长日记** — 图文编辑，置顶关键信息（过敏、疾病、喂养禁忌）
- 🔗 **展示分享** — 宠物卡片分享至微信，自定义勾选展示内容
- 🔒 **隐私管控** — 双层隐私模式（公开/私密），地址脱敏，防骚扰
- 🏠 **上门喂养订单** — 极简下单流程，含押金风控、售后申诉
- ⭐ **双向评价** — 宠主评师傅、师傅评环境，综合评分展示
- 💬 **限时私聊** — 订单有效期内的供需双方沟通，敏感词拦截
- 🚫 **黑名单体系** — 双向拉黑，阻断无效沟通和恶意订单

### 技术栈

| 层 | 技术 |
|---|---|
| 用户端 | UniApp X (Vue3 Composition API) |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | MySQL + Prisma ORM |
| 缓存 | Redis |
| 管理端 | Vue3 + Vite + Element Plus |
| 实时通讯 | Socket.IO |

### 项目结构

```
thePet/
├── pet-app/            # UniApp X 用户端（微信小程序 + Android + iOS）
├── pet-server/         # Express API 后端
├── pet-admin/          # Vue3 管理后台
└── docs/               # 项目文档
    ├── PRD.md          # 产品需求文档
    ├── architecture.md # 架构设计文档
    ├── api.md          # API接口文档
    ├── db-schema.md    # 数据库设计文档
    └── dev-plan.md     # 开发计划
```

### 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/gtc97/thePet.git
cd thePet

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库连接、JWT密钥等配置

# 3. 启动后端
cd pet-server
npm install
npx prisma migrate dev    # 数据库迁移
npx prisma generate       # 生成Prisma Client
npm run dev               # 启动开发服务器 → http://localhost:3000

# 4. 启动管理端
cd pet-admin
npm install
npm run dev               # → http://localhost:5173

# 5. 编译小程序
cd pet-app
npm install
npm run build:mp-weixin
# 用微信开发者工具打开 dist/build/mp-weixin/ 目录
```

### 开发阶段

| 阶段 | 内容 | 状态 |
|---|---|---|
| 阶段1 | 基础脚手架（后端/管理端/用户端骨架） | ✅ 已完成 |
| 阶段2 | 核心宠物功能（档案/相册/日记/分享/收藏/主题） | ✅ 已完成 |
| 阶段3 | 订单与社交（下单/押金/评价/聊天/申诉/黑名单） | ✅ 已完成 |
| 阶段4 | 管理端完善与收尾（管理API/推送/隐私/地图） | ✅ 已完成 |

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- Redis >= 6.0（可选，用于缓存和消息队列）
- HBuilderX（用于UniApp X编译）
