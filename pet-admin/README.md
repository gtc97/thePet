# pet-admin — thePet 管理后台

基于 Vue3 + Element Plus + Vite 的独立网页管理后台。

## 技术栈

- **框架**: Vue3 (Composition API)
- **构建**: Vite
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP**: Axios
- **语言**: TypeScript

## 目录结构

```
src/
├── main.ts                  # 应用入口
├── App.vue                  # 根组件
├── router/
│   └── index.ts             # 路由配置 + 登录守卫
├── api/
│   └── index.ts             # Axios封装（Token注入、401拦截）
├── stores/
│   └── admin.ts             # 管理员认证状态
├── views/                   # 页面视图
│   ├── login/               #  登录页
│   ├── dashboard/           #  数据概览（统计卡片+待处理工单）
│   ├── user/                #  用户管理（列表+详情）
│   ├── pet/                 #  宠物内容风控
│   ├── order/               #  订单管理（列表+详情）
│   ├── deposit/             #  押金管理（流水+配置）
│   ├── dispute/             #  售后仲裁
│   ├── feedback/            #  用户反馈管理
│   └── setting/             #  平台配置（服务项+公告+管理员密码）
└── components/
    └── layout/              # 布局组件
        ├── AdminLayout.vue  #  后台整体布局（侧边栏+顶栏+内容）
        ├── Sidebar.vue      #  左侧导航菜单
        └── Header.vue       #  顶部栏（面包屑+用户信息）
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev
# → http://localhost:5173

# 生产构建
npm run build
# → dist/

# 预览构建结果
npm run preview
```

> 开发模式下已配置 `/api` 和 `/uploads` 代理到 `http://localhost:3000`

## 功能概览

| 功能 | 说明 | 状态 |
|---|---|---|
| 登录 | 独立管理员账号密码登录 | ✅ |
| 数据概览 | 总用户数、宠物数、订单数、待处理工单 | 🔜 数据接入 |
| 用户管理 | 列表查询、详情查看、禁用/解封 | ✅ 页面就绪 |
| 资质审核 | 上门师傅资质通过/驳回 | 🔜 API接入 |
| 宠物审核 | 审核宠物档案/相册/日记内容 | 🔜 API接入 |
| 订单管理 | 多维度筛选、订单详情、强制状态变更 | ✅ 页面就绪 |
| 押金管理 | 押金配置、流水查看、冻结/罚没操作 | ✅ 页面就绪 |
| 售后仲裁 | 申诉处理、纠纷调解、结果记录 | ✅ 页面就绪 |
| 反馈管理 | 反馈分类查看、标记处理状态 | ✅ 页面就绪 |
| 平台配置 | 服务项管理、公告发布、管理员密码修改 | ✅ 页面就绪 |

## 路由结构

```
/login           # 登录页（公开）
/dashboard       # 数据概览
/users           # 用户管理列表
/users/:id       # 用户详情
/pets            # 宠物内容风控
/orders          # 订单管理列表
/orders/:id      # 订单详情
/deposits        # 押金管理
/disputes        # 售后仲裁
/feedbacks       # 用户反馈
/settings        # 平台配置
```

## 权限说明

- 当前为超级管理员单角色模式，拥有后台全部权限
- 路由守卫：未登录自动跳转到 `/login`
- Token 存储在 localStorage，401 自动清除并跳转登录页
