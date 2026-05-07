# thePet 数据库设计文档

## 一、数据库概览

- **数据库类型**：MySQL 8.0+
- **ORM**：Prisma
- **字符集**：utf8mb4
- **表总数**：20张（含管理端和预留表）

## 二、ER关系图（核心实体）

```
User (用户)
 ├── 1:N → Pet (宠物)
 ├── 1:N → ServiceOrder (订单，作为宠主)
 ├── 1:N → ServiceOrder (订单，作为师傅)
 ├── 1:N → Review (评价，评价人)
 ├── 1:N → Review (评价，被评价人)
 ├── 1:N → Deposit (押金)
 ├── 1:N → ChatRoom (聊天室)
 ├── 1:N → ChatMessage (消息)
 ├── 1:N → Dispute (申诉)
 ├── 1:N → Blacklist (黑名单)
 ├── 1:N → Favorite (收藏)
 ├── 1:N → Feedback (反馈)
 ├── 1:N → PushLog (推送记录)
 ├── 1:N → ServiceLocation (服务地址)
 └── 1:N → SmsCode (验证码)

Pet (宠物)
 ├── 1:N → PetAlbum (相册)
 ├── 1:N → PetPhoto (照片)
 ├── 1:N → PetDiary (日记)
 ├── 1:N → PetShare (分享)
 └── 1:N → ServiceOrder (订单)

ServiceOrder (订单)
 ├── 1:N → OrderStatusLog (状态日志)
 ├── 1:N → Review (评价)
 ├── 1:N → Dispute (申诉)
 ├── 1:1 → ChatRoom (聊天室)
 └── 1:1 → Deposit (押金关联)

Deposit (押金)
 └── 1:N → DepositLog (押金流水)
```

## 三、核心表结构

### 3.1 用户相关

#### users（用户表）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 用户ID |
| openid | VARCHAR(64) UNIQUE | 微信OpenID |
| unionid | VARCHAR(64) | 微信UnionID |
| phone | VARCHAR(20) UNIQUE | 手机号 |
| password | VARCHAR(128) | 密码(bcrypt) |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(500) | 头像URL |
| roles | JSON | 身份角色数组 `["PET_OWNER","SERVICE_PROVIDER"]` |
| status | ENUM | ACTIVE / DISABLED |
| province/city/district | VARCHAR(50) | 地区 |
| address | VARCHAR(300) | 详细地址 |
| latitude/longitude | DECIMAL(10,7) | 坐标 |
| avgRating | FLOAT | 服务方平均评分 |
| totalOrders | INT | 服务方接单总数 |
| depositPaid | BOOLEAN | 押金是否已缴 |
| qualificationStatus | VARCHAR(20) | 资质审核状态 pending/approved/rejected |
| qualificationData | JSON | 资质资料 |
| chatDisabled | BOOLEAN | 是否关闭私信 |
| createdAt/updatedAt | DATETIME | 时间戳 |

#### sms_codes（短信验证码）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | ID |
| phone | VARCHAR(20) | 手机号 |
| code | VARCHAR(10) | 验证码 |
| type | VARCHAR(30) | login/register/reset_password/bind |
| expiresAt | DATETIME | 过期时间 |
| used | BOOLEAN | 是否已使用 |

### 3.2 宠物相关

#### pets（宠物表）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 宠物ID |
| ownerId | INT FK | 宠主ID |
| name | VARCHAR(50) | 昵称 |
| species | VARCHAR(30) | 物种（猫/狗/鸟/鱼/其他） |
| breed | VARCHAR(50) | 品种 |
| gender | ENUM | MALE/FEMALE/UNKNOWN |
| birthDate | DATETIME | 出生日期 |
| weight | FLOAT | 体重(kg) |
| avatar | VARCHAR(500) | 头像URL |
| coverImage | VARCHAR(500) | 封面图 |
| dietHabits | TEXT | 饮食习惯 |
| taboos | TEXT | 禁忌事项 |
| description | TEXT | 自定义备注 |
| privacy | ENUM | PUBLIC/PRIVATE |
| isArchived | BOOLEAN | 是否已封存 |
| archivedAt | DATETIME | 封存时间 |

#### pet_albums（宠物相册）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 相册ID |
| petId | INT FK | 宠物ID（级联删除） |
| name | VARCHAR(100) | 相册名称 |
| coverImage | VARCHAR(500) | 封面图 |
| sortOrder | INT | 排序 |

#### pet_photos（宠物照片/视频）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 照片ID |
| petId | INT FK | 宠物ID（级联删除） |
| albumId | INT FK | 相册ID |
| url | VARCHAR(500) | 原图URL |
| thumbnailUrl | VARCHAR(500) | 缩略图URL |
| type | ENUM | IMAGE/VIDEO |
| sourceType | VARCHAR(20) | user（日常素材）/ service（服务记录） |
| width/height | INT | 尺寸 |
| size | INT | 文件大小(bytes) |

#### pet_diaries（成长日记）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 日记ID |
| petId | INT FK | 宠物ID（级联删除） |
| title | VARCHAR(200) | 标题 |
| content | TEXT | 正文 |
| images | JSON | 配图URL数组 |
| isPinned | BOOLEAN | 是否置顶 |
| pinnedAt | DATETIME | 置顶时间 |
| createdAt | DATETIME | 创建时间（系统自动，不可修改） |

#### pet_shares（宠物分享卡片）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 分享ID |
| petId | INT FK | 宠物ID |
| userId | INT FK | 创建人ID |
| title | VARCHAR(200) | 分享标题 |
| images | JSON | 预览图片 |
| showAlbum | BOOLEAN | 是否展示相册 |
| showDiary | BOOLEAN | 是否展示日记 |
| showServiceLogs | BOOLEAN | 是否展示服务记录 |
| shareCode | VARCHAR(20) UNIQUE | 分享码 |
| viewCount | INT | 浏览次数 |
| likeCount | INT | 点赞次数 |

### 3.3 订单相关

#### service_orders（上门服务订单）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 订单ID |
| orderNo | VARCHAR(30) UNIQUE | 订单号(YYYYMMDD+随机) |
| ownerId | INT FK | 宠主ID |
| providerId | INT FK | 师傅ID（接单前为null） |
| petIds | JSON | 绑定宠物ID数组（支持多选） |
| serviceType | VARCHAR(30) | 服务类型 |
| status | ENUM | PENDING→ACCEPTED→IN_PROGRESS→COMPLETED/CANCELLED/DISPUTE |
| address | VARCHAR(300) | 服务地址 |
| scheduledDate | DATE | 预约日期 |
| timeSlot | VARCHAR(20) | 时间段(morning/afternoon/evening) |
| price | DECIMAL(10,2) | 服务金额 |
| depositAmount | DECIMAL(10,2) | 关联押金金额 |
| ownerNote | TEXT | 宠主备注（喂养要求等） |
| providerNote | TEXT | 师傅备注（服务说明） |
| cancelReason | VARCHAR(500) | 取消原因 |
| cancelBy | INT | 取消操作人ID |
| serviceStartAt/EndAt | DATETIME | 服务起止时间（系统记录） |
| serviceDuration | INT | 服务时长（秒） |

#### order_status_logs（订单状态变更日志）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 日志ID |
| orderId | INT FK | 订单ID |
| fromStatus | ENUM | 变更前状态 |
| toStatus | ENUM | 变更后状态 |
| operatorId | INT | 操作人ID（null=系统） |
| remark | VARCHAR(500) | 备注 |
| createdAt | DATETIME | 时间戳 |

### 3.4 交易相关

#### deposits（押金）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 押金ID |
| userId | INT FK | 用户ID（师傅） |
| amount | DECIMAL(10,2) | 押金金额 |
| status | ENUM | UNPAID→PAID→FROZEN→REFUNDED/FORFEITED |
| orderId | INT FK | 关联订单（冻结时关联） |
| transactionId | VARCHAR(100) | 微信支付交易ID |

#### deposit_logs（押金流水）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 流水ID |
| depositId | INT FK | 押金ID |
| action | VARCHAR(30) | pay/freeze/unfreeze/forfeit/refund |
| amount | DECIMAL(10,2) | 操作金额 |
| operatorId | INT | 操作人 |
| remark | VARCHAR(500) | 备注 |

### 3.5 社交相关

#### reviews（双向评价）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 评价ID |
| orderId | INT FK | 订单ID |
| reviewerId | INT FK | 评价人 |
| revieweeId | INT FK | 被评价人 |
| rating | TINYINT | 1-5星 |
| content | TEXT | 评价内容 |
| tags | JSON | 评价标签 |
| images | JSON | 凭证图片 |
| 唯一约束 | (orderId, reviewerId) | 每人每订单仅一次 |

#### chat_rooms（聊天室）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 聊天室ID |
| orderId | INT FK UNIQUE | 订单ID（1:1） |
| userId1 | INT FK | 宠主 |
| userId2 | INT FK | 师傅 |

#### chat_messages（聊天消息）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 消息ID |
| roomId | INT FK | 聊天室ID |
| senderId | INT FK | 发送人 |
| content | TEXT | 消息内容 |
| type | VARCHAR(20) | text/image |
| isRead | BOOLEAN | 是否已读 |

#### blacklist（黑名单）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | ID |
| userId | INT FK | 拉黑人 |
| blockedUserId | INT FK | 被拉黑人 |
| reason | VARCHAR(500) | 拉黑原因 |
| 唯一约束 | (userId, blockedUserId) | 不可重复拉黑 |

#### disputes（售后申诉）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 申诉ID |
| orderId | INT FK | 订单ID |
| initiatorId | INT FK | 发起人 |
| type | VARCHAR(30) | service_quality/damage/no_show/other |
| reason | VARCHAR(500) | 申诉原因 |
| images | JSON | 凭证图片 |
| status | ENUM | PENDING→REVIEWING→RESOLVED/REJECTED |
| resolution | TEXT | 处理结果 |

### 3.6 辅助表

#### favorites（收藏）
| 字段 | 类型 | 说明 |
|---|---|---|
| userId + targetType + targetId | 联合唯一 | 用户+目标类型+目标ID |

#### feedbacks（用户反馈）
| 字段 | 类型 | 说明 |
|---|---|---|
| type | VARCHAR(30) | bug/suggestion/complaint/other |
| status | VARCHAR(20) | pending/processing/resolved |
| remark | TEXT | 处理备注 |

#### push_logs（推送记录）
| 字段 | 类型 | 说明 |
|---|---|---|
| userId | INT FK | 接收用户 |
| type | ENUM | SYSTEM/ORDER/CHAT/REVIEW/DISPUTE/QUALIFICATION |
| isRead | BOOLEAN | 是否已读 |

#### service_locations（服务地址）
| 字段 | 类型 | 说明 |
|---|---|---|
| userId | INT FK | 用户ID |
| address | VARCHAR(300) | 地址 |
| latitude/longitude | DECIMAL(10,7) | 坐标 |
| isDefault | BOOLEAN | 是否默认 |

### 3.7 管理端

#### admins（管理员）
| 字段 | 类型 | 说明 |
|---|---|---|
| username | VARCHAR(50) UNIQUE | 登录用户名 |
| password | VARCHAR(128) | 密码(bcrypt) |

#### admin_login_logs（管理员登录日志）
| 字段 | 类型 | 说明 |
|---|---|---|
| adminId | INT FK | 管理员ID |
| ip | VARCHAR(50) | 登录IP |
| userAgent | VARCHAR(500) | 浏览器标识 |

### 3.8 系统配置

#### system_configs（系统配置）
| 字段 | 类型 | 说明 |
|---|---|---|
| key | VARCHAR(50) UNIQUE | 配置键 |
| value | TEXT | 配置值（JSON） |

### 3.9 直播预留

#### live_rooms（直播房间）
| 字段 | 类型 | 说明 |
|---|---|---|
| orderId | INT | 订单ID |
| streamUrl | VARCHAR(500) | 推流地址 |
| status | VARCHAR(20) | idle/living/ended |

## 四、索引设计

| 表 | 索引字段 | 类型 | 用途 |
|---|---|---|---|
| users | phone | UNIQUE | 手机号登录查询 |
| users | openid | UNIQUE | 微信登录查询 |
| pets | ownerId | INDEX | 用户宠物列表 |
| pet_diaries | (petId, createdAt DESC) | INDEX | 日记时间排序 |
| pet_photos | petId | INDEX | 宠物照片查询 |
| pet_shares | shareCode | UNIQUE | 分享码快速查找 |
| service_orders | ownerId/providerId/status/orderNo | INDEX | 订单多维度查询 |
| chat_messages | (roomId, createdAt) | INDEX | 聊天消息排序 |
| push_logs | (userId, isRead, createdAt DESC) | INDEX | 未读通知查询 |
| blacklist | (userId, blockedUserId) | UNIQUE | 去重检查 |
| reviews | (orderId, reviewerId) | UNIQUE | 防重复评价 |
