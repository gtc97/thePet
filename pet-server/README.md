# pet-server — thePet 后端API服务

基于 Express + TypeScript + Prisma 的轻量化REST API后端。

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **ORM**: Prisma (MySQL)
- **缓存**: Redis (ioredis)
- **认证**: JWT (jsonwebtoken)
- **校验**: Zod
- **文件处理**: Multer + Sharp
- **实时通信**: Socket.IO

## 目录结构

```
src/
├── index.ts              # 服务入口，启动数据库/Redis/HTTP
├── app.ts                # Express应用工厂，注册中间件和路由
├── config/
│   ├── index.ts          # 环境变量统一管理
│   ├── database.ts       # Prisma Client单例
│   └── redis.ts          # Redis连接管理
├── middleware/
│   ├── auth.ts           # JWT认证 + 角色守卫
│   ├── validator.ts      # Zod请求参数校验
│   ├── upload.ts         # Multer文件上传配置
│   └── errorHandler.ts   # 统一错误处理
├── modules/              # 业务模块（按领域拆分）
│   ├── auth/             #  认证（短信/密码/微信登录）
│   ├── user/             #  用户（信息/身份/地址）
│   └── upload/           #  上传（图片/视频）
├── utils/
│   ├── jwt.ts            # Token签发/验证
│   ├── sms.ts            # 短信发送（频率限制）
│   └── fileStorage.ts    # 文件路径管理
└── types/
    └── index.ts          # 公共类型定义
```

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
# 编辑 pet-server/.env 或项目根目录 .env
# 必填: DATABASE_URL, JWT_SECRET

# 数据库迁移
npx prisma migrate dev --name init
npx prisma generate

# 启动开发服务器（热重载）
npm run dev
# → http://localhost:3000

# 健康检查
curl http://localhost:3000/api/health
```

## 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| PORT | 服务端口 | 3000 |
| DATABASE_URL | MySQL连接串 | - |
| JWT_SECRET | JWT签名密钥 | - |
| JWT_EXPIRES_IN | 访问令牌有效期 | 7d |
| JWT_REFRESH_EXPIRES_IN | 刷新令牌有效期 | 30d |
| REDIS_URL | Redis连接串 | redis://localhost:6379 |
| SMS_ACCESS_KEY_ID | 短信服务AK | - |
| SMS_ACCESS_KEY_SECRET | 短信服务SK | - |
| WECHAT_APP_ID | 微信小程序AppID | - |
| WECHAT_APP_SECRET | 微信小程序Secret | - |
| AMAP_API_KEY | 高德地图API Key | - |
| UPLOAD_DIR | 上传文件目录 | ./uploads |
| MAX_FILE_SIZE | 上传文件大小限制 | 10485760 (10MB) |

## 常用命令

```bash
npm run dev          # 开发模式（tsx watch 热重载）
npm run build        # TypeScript编译 → dist/
npm start            # 生产模式运行
npm run db:migrate   # 数据库迁移
npm run db:generate  # 生成Prisma Client
npm run db:studio    # Prisma Studio可视化 → http://localhost:5555
npm run db:seed      # 运行种子数据脚本
```

## API设计规范

- 所有接口以 `/api/v1` 为前缀
- 认证通过 `Authorization: Bearer <token>` 头传递
- 响应统一格式: `{ code: 0, message: "ok", data: {} }`
- code=0 表示成功，非0为业务错误
- 参数校验使用Zod Schema，校验失败返回400

## 模块清单

| 模块 | 路由前缀 | 状态 |
|---|---|---|
| Auth | /api/v1/auth | ✅ 已实现 |
| User | /api/v1/users | ✅ 已实现 |
| Upload | /api/v1/upload | ✅ 已实现 |
| Pet | /api/v1/pets | 🔜 阶段2 |
| Album | /api/v1/pets/:petId/albums | 🔜 阶段2 |
| Diary | /api/v1/pets/:petId/diaries | 🔜 阶段2 |
| Share | /api/v1/shares | 🔜 阶段2 |
| Order | /api/v1/orders | 🔜 阶段3 |
| Deposit | /api/v1/deposits | 🔜 阶段3 |
| Review | /api/v1/orders/:orderId/reviews | 🔜 阶段3 |
| Chat | /api/v1/chat | 🔜 阶段3 |
| Dispute | /api/v1/disputes | 🔜 阶段3 |
| Blacklist | /api/v1/blacklist | 🔜 阶段3 |
| Favorite | /api/v1/favorites | 🔜 阶段2 |
| Feedback | /api/v1/feedback | 🔜 阶段3 |
| Notification | /api/v1/notifications | 🔜 阶段4 |
| Map | /api/v1/map | 🔜 阶段4 |
| Admin | /api/v1/admin | 🔜 阶段4 |
