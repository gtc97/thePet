# thePet 部署方案文档

## 一、部署架构

```
┌─────────────────────────────────────────────┐
│                 Nginx (:80)                  │
│  静态资源 + API反向代理 + WebSocket代理       │
├──────────────┬──────────────────────────────┤
│  /api/*      │  /admin/*     │  /uploads/*  │
▼              ▼               ▼              │
┌──────────┐ ┌──────────────┐                 │
│ 后端API   │ │ 管理端SPA     │   静态文件     │
│ PM2       │ │ 纯静态文件    │   直读         │
│ :5000     │ │ dist/        │   uploads/     │
└──────┬────┘ └──────────────┘                 │
       │                                       │
  ┌────┼────┬──────────┐                       │
  ▼    ▼    ▼          ▼                       │
┌────┐ ┌──┐ ┌──────┐ ┌──────┐                 │
│MySQL│ │Redis│ │本地  │ │第三方│                │
│ 5.7 │ │ 7.x │ │存储  │ │API   │                │
└────┘ └──┘  └──────┘ └──────┘                 │
└─────────────────────────────────────────────┘
```

## 二、生产服务器信息

| 项目 | 值 |
|------|-----|
| **服务器 IP** | 39.96.17.9 |
| **SSH 端口** | 22 |
| **操作系统** | Alibaba Cloud Linux 3 (x86_64) |
| **CPU / 内存** | 2核 / 3.5GB |
| **磁盘** | 49GB SSD（可用 36GB） |
| **宝塔面板** | http://39.96.17.9:8888 |

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Nginx | 80 | 入口，反向代理 |
| 后端 API | 5000 | PM2 管理，仅本地访问 |
| MySQL | 3306 | 仅本地访问 |
| Redis | 6379 | 仅本地访问（可选） |

## 三、已部署路径

| 组件 | 路径 |
|------|------|
| 项目根目录 | `/opt/thepet/` |
| 后端服务 | `/opt/thepet/pet-server/` |
| 管理端 | `/opt/thepet/pet-admin/` |
| 上传文件 | `/opt/thepet/pet-server/uploads/` |
| 环境变量 | `/opt/thepet/pet-server/.env` |
| Nginx 配置 | `/etc/nginx/conf.d/thepet.conf` |
| PM2 进程 | `thepet-api` |

## 四、访问地址

| 入口 | 地址 |
|------|------|
| **API 接口** | http://39.96.17.9/api/v1/ |
| **管理后台** | http://39.96.17.9/admin/ |
| **宝塔面板** | http://39.96.17.9:8888 |

## 五、数据库信息

| 项目 | 值 |
|------|-----|
| 数据库名 | thepet |
| 用户名 | thepet |
| 密码 | ThEpet2026! |
| Root 密码 | ThEpet2026! |
| 字符集 | utf8mb4 |

## 六、环境变量配置

```bash
# /opt/thepet/pet-server/.env

# 数据库
DATABASE_URL="mysql://thepet:ThEpet2026!@localhost:3306/thepet"

# JWT
JWT_SECRET="thepet-jwt-secret-2026-production-xK9mP2vL"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Redis
REDIS_URL="redis://localhost:6379"

# 服务器
PORT=5000
NODE_ENV=production

# 文件上传
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# 以下待配置
SMS_ACCESS_KEY_ID=""
SMS_ACCESS_KEY_SECRET=""
WECHAT_APP_ID=""
WECHAT_APP_SECRET=""
WECHAT_PAY_MCH_ID=""
WECHAT_PAY_API_KEY=""
AMAP_API_KEY=""
```

## 七、Nginx 配置

```nginx
# /etc/nginx/conf.d/thepet.conf
server {
    listen 80;
    server_name 39.96.17.9;

    # 管理端静态文件
    location /admin {
        alias /opt/thepet/pet-admin/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 上传文件
    location /uploads/ {
        alias /opt/thepet/pet-server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 代理
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1024;

    # 默认首页
    location / {
        return 200 '{"service":"thepet-api","status":"running"}';
        add_header Content-Type application/json;
    }
}
```

## 八、常用运维命令

### 服务管理

```bash
# 查看 PM2 状态
pm2 status

# 重启后端服务
pm2 reload thepet-api

# 查看日志
pm2 logs thepet-api --lines 50

# 重载 Nginx
systemctl reload nginx
```

### 更新部署

```bash
# 1. 上传新代码到服务器
scp thepet-deploy.tar.gz root@39.96.17.9:/opt/

# 2. 解压覆盖
ssh root@39.96.17.9
tar -xzf /opt/thepet-deploy.tar.gz -C /opt/thepet/

# 3. 更新后端
cd /opt/thepet/pet-server
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 reload thepet-api

# 4. 更新管理端
cd /opt/thepet/pet-admin
npm install
npx vite build
```

### 数据库备份

```bash
# 手动备份
mysqldump -u thepet -p'ThEpet2026!' thepet | gzip > /opt/backups/thepet_$(date +%Y%m%d).sql.gz

# 恢复
gunzip < /opt/backups/thepet_20260518.sql.gz | mysql -u thepet -p'ThEpet2026!' thepet
```

### 健康检查

```bash
# API 检查
curl -s http://localhost:5000/api/v1/auth/login-by-code -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"888888"}'

# Nginx 检查
curl -s http://localhost/

# 管理端检查
curl -s -o /dev/null -w "%{http_code}" http://localhost/admin/
```

## 九、待配置项

| 项目 | 当前状态 | 配置方式 |
|------|----------|----------|
| Redis | 未安装（优雅降级） | `yum install redis && systemctl start redis` |
| SSL/HTTPS | 未配置 | 域名备案后使用 Certbot |
| 短信服务 | 模拟实现 | 阿里云短信 SDK |
| 微信小程序 | 未配置 | .env 填写 AppID/Secret |
| 微信支付 | 未配置 | .env 填写商户号/密钥 |
| 高德地图 | 未配置 | .env 填写 API Key |

## 十、安全建议

| 项目 | 措施 |
|------|------|
| SSH | 修改默认端口、禁用密码登录（改用密钥） |
| MySQL | 仅本地访问、定期更换密码 |
| 防火墙 | 仅开放 80/443/22 端口 |
| 宝塔面板 | 修改默认端口、设置强密码 |
| JWT Secret | 定期更换 |
| 文件上传 | 限制大小和类型 |
| 日志 | 定期清理 PM2 和 Nginx 日志 |

---

**文档版本**: v2.0  
**生成日期**: 2026-05-18  
**部署服务器**: 39.96.17.9 (阿里云)  
**适用范围**: thePet 后端/管理端生产部署
