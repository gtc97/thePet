# thePet API 接口文档

## 通用说明

- **Base URL**: `http://localhost:3000/api/v1`
- **认证方式**: `Authorization: Bearer <token>`（除登录接口外均需携带）
- **响应格式**:

```json
{
  "code": 0,        // 0=成功, 非0=失败
  "message": "ok",  // 提示信息
  "data": {}        // 业务数据
}
```

---

## 一、认证模块 `/auth`

### 1.1 发送短信验证码
```
POST /auth/send-sms-code
```
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| phone | string | 是 | 手机号 |
| type | string | 是 | login / register / reset_password / bind |

> 频率限制：同一手机号60秒内仅可发送1次，验证码5分钟有效。开发环境万能码：`888888`

### 1.2 验证码登录
```
POST /auth/login-by-code
```
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| phone | string | 是 | 手机号 |
| code | string | 是 | 6位验证码 |

> 未注册手机号自动创建账号，默认昵称为「用户+手机尾号后4位」

### 1.3 密码登录
```
POST /auth/login-by-password
```
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码（6位以上） |

### 1.4 微信登录
```
POST /auth/wechat-login
```
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| code | string | 是 | wx.login()返回的code |

### 1.5 注册
```
POST /auth/register
```
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码 |
| nickname | string | 是 | 昵称 |
| password | string | 否 | 密码 |

### 1.6 重置密码
```
POST /auth/reset-password
```
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码 |
| newPassword | string | 是 | 新密码 |

### 1.7 刷新令牌
```
POST /auth/refresh-token
```
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| refreshToken | string | 是 | 刷新令牌 |

### 登录响应
```json
{
  "code": 0,
  "data": {
    "accessToken": "xxx",
    "refreshToken": "xxx",
    "userId": 1,
    "roles": ["PET_OWNER"]
  }
}
```

---

## 二、用户模块 `/users`

### 2.1 获取个人信息
```
GET /users/me
```
返回完整用户信息（含手机号、地址、资质状态等）

### 2.2 更新个人信息
```
PUT /users/me
```
| 参数 | 类型 | 说明 |
|---|---|---|
| nickname | string | 昵称 |
| avatar | string | 头像URL |
| bio | string | 个人简介 |
| province/city/district | string | 地区 |
| address | string | 地址 |
| chatDisabled | boolean | 关闭私信 |

### 2.3 提交资质申请
```
POST /users/me/qualification
```
| 参数 | 类型 | 说明 |
|---|---|---|
| realName | string | 真实姓名 |
| idCard | string | 身份证号 |
| photos | string[] | 资质照片URL数组 |
| bio | string | 个人介绍 |

### 2.4 切换身份
```
PUT /users/me/roles
```
| 参数 | 类型 | 说明 |
|---|---|---|
| role | string | PET_OWNER / SERVICE_PROVIDER |

> 切换到SERVICE_PROVIDER需资质审核通过，返回新Token

### 2.5 获取用户公开信息
```
GET /users/:id
```
返回脱敏后的公开信息（昵称、头像、评分、服务次数、城市）

### 2.6 服务地址管理
```
GET    /users/me/locations          # 地址列表
POST   /users/me/locations          # 添加地址
PUT    /users/me/locations/:id      # 更新地址
DELETE /users/me/locations/:id      # 删除地址
```

---

## 三、上传模块 `/upload`

### 3.1 上传单张图片
```
POST /upload/image
Content-Type: multipart/form-data
```
| 参数 | 类型 | 说明 |
|---|---|---|
| file | File | 图片文件（≤10MB） |
| module | string | 模块名（pet_photo/diary/avatar/review等） |

> 自动压缩至1920px宽，生成400px缩略图，JPEG质量80%

### 3.2 批量上传图片
```
POST /upload/images
Content-Type: multipart/form-data
```
| 参数 | 类型 | 说明 |
|---|---|---|
| files | File[] | 最多9张图片 |

### 3.3 上传视频
```
POST /upload/video
Content-Type: multipart/form-data
```
| 参数 | 类型 | 说明 |
|---|---|---|
| file | File | 视频文件（≤10MB） |

### 上传响应
```json
{
  "code": 0,
  "data": {
    "url": "/uploads/pet_photo/1/202405/xxx.jpg",
    "thumbnailUrl": "/uploads/thumbnails/pet_photo/1/202405/xxx_thumb.jpg",
    "width": 1920,
    "height": 1080,
    "size": 245760
  }
}
```

---

## 四、宠物模块 `/pets`（阶段2实现）

```
GET    /pets                    # 我的宠物列表
POST   /pets                    # 添加宠物
GET    /pets/:id                # 宠物详情
PUT    /pets/:id                # 编辑宠物
DELETE /pets/:id                # 删除宠物（级联清空）
POST   /pets/:id/archive        # 封存档案
POST   /pets/:id/unarchive      # 解除封存
GET    /pets/:id/stats          # 数据统计
```

---

## 五、相册模块 `/pets/:petId`（阶段2实现）

```
GET    /pets/:petId/albums       # 相册列表
POST   /pets/:petId/albums       # 创建相册
PUT    /pets/:petId/albums/:id   # 更新相册
DELETE /pets/:petId/albums/:id   # 删除相册

GET    /pets/:petId/photos       # 照片列表
POST   /pets/:petId/photos       # 上传照片
DELETE /pets/:petId/photos/:id   # 删除照片
```

---

## 六、日记模块（阶段2实现）

```
GET    /pets/:petId/diaries          # 日记列表（分页）
POST   /pets/:petId/diaries          # 创建日记
GET    /pets/:petId/diaries/:id      # 日记详情
PUT    /pets/:petId/diaries/:id      # 编辑日记
DELETE /pets/:petId/diaries/:id      # 删除日记
POST   /pets/:petId/diaries/:id/pin  # 切换置顶
```

---

## 七、分享模块（阶段2实现）

```
GET    /shares                  # 公开分享广场
POST   /pets/:petId/shares      # 创建分享卡片
GET    /shares/:id              # 分享详情
DELETE /shares/:id              # 删除分享
GET    /shares/code/:code       # 通过分享码查看
POST   /shares/:id/like         # 点赞
```

---

## 八、订单模块 `/orders`（阶段3实现）

```
GET    /orders                  # 我的订单列表（按身份区分）
POST   /orders                  # 创建订单（宠主）
GET    /orders/:id              # 订单详情
POST   /orders/:id/accept       # 师傅接单
POST   /orders/:id/start        # 开始服务（记录开始时间）
POST   /orders/:id/complete     # 完成服务（上传成果）
POST   /orders/:id/cancel       # 取消订单（需填写原因）
GET    /orders/:id/timeline     # 订单状态时间线
GET    /orders/nearby           # 附近可接订单（师傅视角）
```

---

## 九、押金模块 `/deposits`（阶段3实现）

```
GET    /deposits/me             # 我的押金状态
POST   /deposits/pay            # 缴纳押金（发起微信支付）
POST   /deposits/callback       # 微信支付回调（无需认证）
GET    /deposits/me/logs        # 押金流水明细
```

---

## 十、评价模块（阶段3实现）

```
POST   /orders/:orderId/reviews # 提交评价
GET    /orders/:orderId/reviews # 查看订单评价
GET    /users/:id/reviews       # 用户收到的评价列表
```

---

## 十一、聊天模块（阶段3实现）

```
GET    /orders/:orderId/chat/room       # 获取/创建聊天室
GET    /chat/rooms                      # 我的聊天室列表
GET    /chat/rooms/:roomId/messages     # 消息记录（分页）
POST   /chat/rooms/:roomId/messages     # 发送消息（REST降级）
WS     /ws/chat                         # WebSocket实时通信
```

---

## 十二、申诉模块（阶段3实现）

```
POST   /orders/:orderId/disputes  # 发起申诉
GET    /disputes/:id              # 申诉详情
GET    /disputes/me               # 我的申诉列表
PUT    /disputes/:id/cancel       # 撤销申诉
```

---

## 十三、其他模块

```
# 黑名单
GET    /blacklist                # 黑名单列表
POST   /blacklist                # 拉黑用户
DELETE /blacklist/:id            # 解除拉黑

# 收藏
GET    /favorites                # 收藏列表
POST   /favorites                # 添加收藏
DELETE /favorites/:id            # 取消收藏

# 反馈
POST   /feedback                 # 提交反馈

# 通知
GET    /notifications            # 通知列表
GET    /notifications/unread-count # 未读数
PUT    /notifications/:id/read   # 标记已读
PUT    /notifications/read-all   # 全部已读

# 地图（服务端代理）
GET    /map/geocode              # 地址→坐标
GET    /map/reverse-geocode      # 坐标→地址
GET    /map/route                # 路线规划
```

---

## 十四、管理端接口 `/admin`（管理员专用）

```
# 认证
POST   /admin/auth/login         # 管理员登录
GET    /admin/auth/me            # 管理员信息

# 仪表盘
GET    /admin/dashboard          # 数据概览

# 用户管理
GET    /admin/users              # 用户列表（支持筛选）
GET    /admin/users/:id          # 用户详情
PUT    /admin/users/:id/status   # 禁用/解封用户
POST   /admin/users/:id/approve-qualification  # 审核资质通过
POST   /admin/users/:id/reject-qualification   # 驳回资质

# 订单管理
GET    /admin/orders             # 全量订单（支持筛选）
GET    /admin/orders/:id         # 订单详情
PUT    /admin/orders/:id/status  # 强制修改订单状态

# 押金管理
GET    /admin/deposits           # 押金列表
PUT    /admin/deposits/config    # 修改押金金额配置
POST   /admin/deposits/:id/forfeit # 罚没押金

# 申诉仲裁
GET    /admin/disputes           # 申诉列表
PUT    /admin/disputes/:id/resolve # 处理申诉

# 反馈管理
GET    /admin/feedbacks          # 反馈列表
PUT    /admin/feedbacks/:id      # 更新处理状态
```

---

## 十五、错误码说明

| code | HTTP状态码 | 说明 |
|---|---|---|
| 0 | 200 | 成功 |
| 1 | 400 | 请求参数错误 |
| 1 | 401 | 未登录或Token过期 |
| 1 | 403 | 无权限访问 |
| 1 | 404 | 资源不存在 |
| 1 | 429 | 请求过于频繁 |
| 1 | 500 | 服务器内部错误 |
