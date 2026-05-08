# thePet 架构设计文档

## 一、整体架构

```
┌──────────────────────────────────────────────────────────┐
│                      用户端 (UniApp X)                     │
│  微信小程序 / Android APP / iOS APP 三端统一               │
│  Vue3 Composition API + Pinia + UniRouter                 │
└──────────────┬───────────────────────────────────────────┘
               │ HTTPS / WebSocket
               ▼
┌──────────────────────────────────────────────────────────┐
│                    API网关 (Express)                       │
│  JWT认证 → 角色守卫 → Zod校验 → 业务路由                   │
└──────────────┬───────────────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────────┐
    ▼          ▼          ▼              ▼
┌────────┐ ┌──────┐ ┌──────────┐ ┌──────────────┐
│ MySQL  │ │ Redis│ │ 本地存储  │ │  第三方服务   │
│(Prisma)│ │ 缓存 │ │ (Sharp)  │ │ 微信/短信/地图│
└────────┘ └──────┘ └──────────┘ └──────────────┘
```

## 二、后端架构（pet-server）

### 分层设计

```
src/
├── config/          # 配置层（环境变量、数据库、Redis连接）
├── middleware/       # 中间件层（认证、权限、校验、上传、错误处理）
├── modules/         # 业务模块层（按领域拆分）
│   ├── auth/        #  认证模块
│   ├── user/        #  用户模块
│   ├── admin/       #  管理端API
│   ├── upload/      #  上传模块
│   ├── pet/         #  宠物模块
│   ├── album/       #  相册/照片模块
│   ├── diary/       #  日记模块
│   ├── share/       #  分享模块
│   ├── favorite/    #  收藏模块
│   ├── order/       #  订单模块
│   ├── deposit/     #  押金模块
│   ├── review/      #  评价模块
│   ├── dispute/     #  申诉模块
│   ├── chat/        #  聊天模块
│   ├── blacklist/   #  黑名单模块
│   ├── notification/#  通知模块
│   ├── map/          #  地图代理
│   ├── feedback/     #  用户反馈
│   └── admin/        #  管理端API
├── utils/           # 工具函数层（JWT、SMS、文件存储）
└── types/           # 类型定义层
```

### 请求处理流程

```
客户端请求
  → CORS中间件
  → JSON解析中间件
  → authMiddleware（JWT验证）
  → roleGuard（角色权限检查）
  → validate（Zod参数校验）
  → Controller（路由处理）
  → Service（业务逻辑）
  → Prisma（数据库操作）
  → 响应返回
  → errorHandler（统一错误处理）
```

### 关键设计决策

| 决策 | 方案 | 原因 |
|---|---|---|
| 身份模型 | User.roles JSON数组 | 支持双身份共存，无需关联表 |
| 订单状态机 | 枚举 + 状态日志表 | 完整审计追踪，不可篡改 |
| 隐私控制 | Pet.privacy + PetShare字段级 | 双层控制，灵活可配 |
| 文件存储 | 本地 + Sharp压缩 | 开发阶段简单，OSS就绪 |
| 聊天限制 | 1:1绑定订单 + 时间窗口 | 安全防骚扰 |
| 押金管理 | per-user deposit + per-order freeze | 简化资金流转 |

### 模块依赖关系

```
auth ←── user ←── pet ←── album
                 ←── diary
                 ←── share
                 ←── order ←── deposit
                          ←── review
                          ←── chat
                          ←── dispute
                 ←── blacklist
                 ←── favorite
        upload ←── (all modules)
  notification ←── (all modules)
```

## 三、前端架构（pet-app）

### 路由设计

```
TabBar（4个主Tab）
├── 首页 (pages/index/index)
├── 订单 (pages/order/list)
├── 消息 (pages/message/index)
└── 我的 (pages/user/index)

SubPackages（分包加载，28个子页面）
├── subPages/login/       # 登录注册
├── subPages/pet/         # 宠物管理（列表/详情/添加/编辑）
├── subPages/album/       # 相册（列表/预览）
├── subPages/diary/       # 日记（列表/详情/创建）
├── subPages/share/       # 分享（创建/详情/公开页）
├── subPages/order/       # 订单（创建/详情/申诉/评价）
├── subPages/chat/        # 聊天室
├── subPages/map/         # 地图（选点/路线）
├── subPages/user/        # 用户中心子页（资料/身份/押金/地址/黑名单/收藏/评价）
└── subPages/setting/     # 设置（主设置/隐私/反馈）
```

### 状态管理（Pinia）

```
userStore
├── state: token, userInfo, currentRole
├── getters: isLoggedIn, isOwner, isProvider, isQualified
└── actions: login, logout, fetchProfile, switchRole

petStore
├── state: pets[], currentPet, loading
└── actions: fetchPets, fetchPetDetail, addPet, editPet, removePet
```

### API请求层

```
request.js（封装uni.request）
├── 自动注入JWT Token
├── 401自动刷新Token
├── 刷新队列防并发
└── 统一错误处理
```

## 四、管理端架构（pet-admin）

```
src/
├── router/           # Vue Router（路由守卫）
├── api/              # Axios封装（Token注入 + 401处理）
├── stores/           # Pinia（admin认证状态）
├── views/            # 页面视图（9个功能页面）
│   ├── login/        #  登录页
│   ├── dashboard/    #  数据概览
│   ├── user/         #  用户管理
│   ├── pet/          #  宠物内容风控
│   ├── order/        #  订单管理
│   ├── deposit/      #  押金管理
│   ├── dispute/      #  售后仲裁
│   ├── feedback/     #  用户反馈
│   └── setting/      #  平台配置
└── components/       # 布局组件
    └── layout/       #  AdminLayout / Sidebar / Header
```

## 五、数据库架构

- 数据库：MySQL 8.0+
- ORM：Prisma（Type-safe，自动迁移）
- 核心表：20张
- 字符集：utf8mb4
- 详见 [db-schema.md](./db-schema.md)

## 六、安全设计

| 层面 | 措施 |
|---|---|
| 传输安全 | HTTPS + JWT签名 |
| 认证 | 双Token机制（Access 7天 + Refresh 30天） |
| 授权 | 角色守卫 + 资源归属校验 |
| 输入校验 | Zod Schema校验所有请求参数 |
| 隐私 | 地址脱敏、敏感字段仅订单关联可见 |
| 防骚扰 | 聊天仅限订单有效期+7天、敏感词过滤、私信可关闭 |
| 防刷 | Redis短信频率限制（60s/次）、上传频率限制 |
| 数据保护 | 核心数据软删除、操作日志审计 |
