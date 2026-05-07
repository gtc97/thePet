# pet-app — thePet 用户端（UniApp X）

基于 UniApp X (Vue3) 的跨平台用户端，适配微信小程序、Android APP、iOS APP。

## 技术栈

- **框架**: UniApp X (Vue3 Composition API)
- **构建**: Vite + @dcloudio/vite-plugin-uni
- **状态管理**: Pinia
- **样式**: SCSS
- **地图**: 高德地图SDK（预留）

## 目录结构

```
pet-app/
├── pages.json              # 页面路由配置（TabBar + 分包）
├── manifest.json           # 应用配置（微信/APP权限）
├── uni.scss                # 全局SCSS变量
├── App.vue                 # 应用入口
├── main.js                 # 主入口（SSR工厂函数）
├── vite.config.ts          # Vite构建配置
│
├── api/                    # API请求层
│   ├── request.js          #  请求封装（自动Token刷新、401队列）
│   ├── auth.js             #  认证接口
│   └── pet.js              #  宠物接口
│
├── store/                  # Pinia状态管理
│   ├── user.js             #  用户状态（登录/身份/角色切换）
│   └── pet.js              #  宠物状态（列表/详情/CRUD）
│
├── pages/                  # 主包页面（TabBar）
│   ├── index/              #  首页广场
│   ├── order/              #  订单列表
│   ├── message/            #  消息通知
│   └── user/               #  个人中心
│
├── subPages/               # 分包页面（按需加载）
│   ├── login/              #  登录注册
│   ├── pet/                #  宠物管理（列表/详情/添加/编辑）
│   ├── album/              #  相册（列表/预览）
│   ├── diary/              #  日记（列表/详情/创建）
│   ├── share/              #  分享（创建/详情/公开页）
│   ├── order/              #  订单（创建/详情/申诉/评价）
│   ├── chat/               #  聊天室
│   ├── map/                #  地图（选点/路线）
│   ├── user/               #  用户子页（资料/身份/押金/地址/黑名单/收藏/评价）
│   └── setting/            #  设置（主设置/隐私/反馈）
│
├── components/             # 通用组件
│   └── common/
│       ├── EmptyState.vue  #  空状态占位
│       ├── ImageUploader.vue # 图片上传器
│       └── RatingStar.vue  #  星级评分
│
└── static/                 # 静态资源
    └── tab/                #  TabBar图标
```

## 快速开始

### 方式一：HBuilderX（推荐）

1. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开 `pet-app` 目录
3. 点击「运行」→ 选择目标平台（微信小程序/H5/APP）

### 方式二：命令行

```bash
# 安装依赖
npm install

# 运行到H5（浏览器调试）
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin

# 运行到APP
npm run dev:app
```

## 页面路由

### TabBar（4个主Tab）

| 页面 | 路径 | 说明 |
|---|---|---|
| 首页 | pages/index/index | 快捷入口 + 发现萌宠广场 |
| 订单 | pages/order/list | 订单列表（身份感知：宠主/师傅） |
| 消息 | pages/message/index | 通知列表 + 私聊入口 |
| 我的 | pages/user/index | 个人信息 + 身份切换 + 功能菜单 |

### 分包（28个子页面）

| 分组 | 页面 | 状态 |
|---|---|---|
| 登录 | 登录/注册 | ✅ 已实现 |
| 宠物 | 列表、详情、添加、编辑 | ✅ 已实现 |
| 相册 | 列表、预览 | 🔜 阶段2 |
| 日记 | 列表、详情、创建 | 🔜 阶段2 |
| 分享 | 创建、详情、公开页 | 🔜 阶段2 |
| 订单 | 创建、详情、申诉、评价 | 🔜 阶段3 |
| 聊天 | 聊天室 | 🔜 阶段3 |
| 地图 | 选点、路线规划 | 🔜 阶段3 |
| 用户 | 编辑资料、身份切换、资质申请、押金、地址、黑名单、收藏、评价 | 🔜 阶段2-3 |
| 设置 | 设置、隐私、反馈 | 🔜 阶段4 |

## 状态管理

### userStore

```js
{
  token,           // JWT访问令牌
  userInfo,        // 用户信息（昵称/手机/角色/资质状态）
  currentRole,     // 当前活跃身份（PET_OWNER / SERVICE_PROVIDER）

  // 计算属性
  isLoggedIn,      // 是否已登录
  isOwner,         // 是否为宠物主
  isProvider,      // 是否为上门师傅
  isQualified,     // 师傅资质是否已审核通过

  // 操作
  login(),         // 验证码登录
  fetchProfile(),  // 获取个人信息
  switchRole(),    // 切换身份（重新签发Token）
  logout()         // 退出登录
}
```

### petStore

```js
{
  pets,            // 宠物列表
  currentPet,      // 当前查看的宠物详情
  loading,         // 加载状态

  // 操作
  fetchPets(),       // 获取宠物列表
  fetchPetDetail(),  // 获取宠物详情
  addPet(),          // 添加宠物
  editPet(),         // 编辑宠物
  removePet()        // 删除宠物
}
```

## API请求层

`api/request.js` 封装了 `uni.request`，提供：

- **自动Token注入** — 从Storage读取JWT并注入Authorization头
- **自动Token刷新** — 401时自动使用refreshToken刷新，刷新期间请求排队
- **Token过期处理** — 刷新失败自动跳转登录页
- **统一错误处理** — 非0 code自动reject

## 隐私设计

- 宠物档案支持「公开/私密」双模式
- 私密模式下外部用户无法查看、无法分享
- 用户手机号、地址仅订单关联方可查看脱敏版本
- 分享卡片支持字段级隐私控制（可选择隐藏年龄/品种等）

## 适配说明

- 使用 `rpx` 单位（750rpx = 屏幕宽度），自动适配不同屏幕
- 条件编译 `#ifdef MP-WEIXIN` / `#ifdef APP-PLUS` 处理平台差异
- 微信小程序：通过 `<button open-type="getPhoneNumber">` 获取手机号
- APP端：使用原生地图模块
