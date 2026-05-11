# thePet 部署方案文档

## 一、部署架构

```
┌─────────────────────────────────────────────┐
│                 Nginx (HTTPS)                │
│  静态资源 + API反向代理 + WebSocket代理       │
├──────────────┬──────────────────────────────┤
│  /api/*      │  /admin/*     │  /uploads/*  │
▼              ▼               ▼              │
┌──────────┐ ┌──────────────┐                 │
│ 后端API   │ │ 管理端SPA     │   静态文件     │
│ PM2集群   │ │ 纯静态文件    │   直读         │
│ :3000     │ │ dist/        │   uploads/     │
└──────┬────┘ └──────────────┘                 │
       │                                       │
  ┌────┼────┬──────────┐                       │
  ▼    ▼    ▼          ▼                       │
┌────┐ ┌──┐ ┌──────┐ ┌──────┐                 │
│MySQL│ │Redis│ │本地  │ │第三方│                │
│ 8.0 │ │ 7.x │ │存储  │ │API   │                │
└────┘ └──┘  └──────┘ └──────┘                 │
└─────────────────────────────────────────────┘
```

## 二、服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2核 | 4核 |
| 内存 | 4GB | 8GB |
| 磁盘 | 40GB SSD | 80GB SSD |
| 系统 | CentOS 7+ / Ubuntu 20.04+ / Windows Server |
| 带宽 | 5Mbps | 10Mbps+ |

## 三、环境安装

### 3.1 Node.js

```bash
# Linux/macOS 使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22
nvm alias default 22

# Windows 使用 nvm-windows
# https://github.com/coreybutler/nvm-windows
nvm install 22.14.0
nvm use 22.14.0
```

### 3.2 MySQL 8.0

```bash
# Ubuntu
apt install mysql-server-8.0

# CentOS
yum install mysql-server

# 创建数据库
mysql -u root -p
CREATE DATABASE thepet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'thepet'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON thepet.* TO 'thepet'@'localhost';
FLUSH PRIVILEGES;
```

### 3.3 Redis

```bash
# Ubuntu
apt install redis-server

# CentOS
yum install redis

# 或 Docker
docker run -d --name redis \
  -p 127.0.0.1:6379:6379 \
  --restart always \
  redis:7-alpine redis-server --requirepass your_redis_password
```

### 3.4 Nginx

```bash
# Ubuntu
apt install nginx

# CentOS
yum install nginx
```

### 3.5 Java JDK 21（可选）

部分运维脚本需要：
```bash
# 下载 Temurin JDK 21
wget https://mirrors.tuna.tsinghua.edu.cn/Adoptium/21/jdk/x64/linux/OpenJDK21U-jdk_x64_linux_hotspot_21.0.11_10.tar.gz
tar -xzf OpenJDK21U-jdk_x64_linux_hotspot_21.0.11_10.tar.gz -C /usr/local/
# 配置 /etc/profile
export JAVA_HOME=/usr/local/jdk-21.0.11+10
export PATH=$JAVA_HOME/bin:$PATH
```

### 3.6 Python 3.12+（可选）

```bash
# Ubuntu
apt install python3 python3-pip

# 验证
python3 --version
```

### 3.7 PM2（进程管理）

```bash
npm install -g pm2
```

## 四、项目部署

### 4.1 获取代码

```bash
git clone <repo-url> /opt/thepet
cd /opt/thepet
```

### 4.2 后端部署 (pet-server)

```bash
cd pet-server
npm install --production

# 配置环境变量
cp ../.env.example .env
vim .env
# 按生产环境修改：
# NODE_ENV=production
# DATABASE_URL=mysql://thepet:strong_password@localhost:3306/thepet
# JWT_SECRET=<生成一个随机密钥>
# REDIS_URL=redis://:your_redis_password@localhost:6379

# 数据库迁移
npx prisma migrate deploy
npx prisma generate

# TypeScript 编译
npm run build

# PM2 启动
pm2 start dist/index.js --name pet-server --instances 2
pm2 save
pm2 startup  # 开机自启
```

### 4.3 管理端部署 (pet-admin)

```bash
cd pet-admin
npm install --production
npm run build
# 产出 dist/ 目录
```

### 4.4 Nginx 配置

```nginx
# /etc/nginx/sites-available/thepet
server {
    listen 80;
    server_name your-domain.com;

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
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 代理
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1024;
}
```

启用配置：
```bash
ln -s /etc/nginx/sites-available/thepet /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4.5 SSL/HTTPS 配置

```bash
# 使用 Certbot 获取免费 SSL 证书
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## 五、用户端发布

### 微信小程序

1. 用 HBuilderX 打开 `pet-app` 目录
2. 发行 → 微信小程序
3. 登录微信小程序后台上传代码
4. 提交审核

### Android APP

1. HBuilderX → 发行 → 原生App-云打包
2. 配置签名证书
3. 上传到各大应用商店

### iOS APP

1. HBuilderX → 发行 → 原生App-云打包
2. 需 Apple Developer 账号和证书

## 六、环境变量生产配置

```bash
# pet-server/.env 生产环境配置

# 数据库
DATABASE_URL="mysql://thepet:strong_password@localhost:3306/thepet"

# JWT - 务必修改
JWT_SECRET="$(openssl rand -base64 64)"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Redis - 务必设置密码
REDIS_URL="redis://:strong_redis_password@localhost:6379"

# 短信服务（阿里云）
SMS_ACCESS_KEY_ID="your-aliyun-ak"
SMS_ACCESS_KEY_SECRET="your-aliyun-sk"
SMS_SIGN_NAME="thePet"
SMS_TEMPLATE_CODE="SMS_XXXXXXXXX"

# 微信小程序
WECHAT_APP_ID="wx_xxxx"
WECHAT_APP_SECRET="xxxx"

# 微信支付
WECHAT_PAY_MCH_ID=""
WECHAT_PAY_API_KEY=""
WECHAT_PAY_CERT_PATH="/opt/thepet/certs/apiclient_cert.p12"

# 高德地图
AMAP_API_KEY="your-amap-key"

# 文件上传
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# 服务器
PORT=3000
NODE_ENV=production
```

## 七、安全加固清单

| 项目 | 措施 |
|------|------|
| 数据库 | 独立用户、强密码、仅本地访问 |
| Redis | 设置密码、绑定127.0.0.1 |
| JWT | 随机生成Secret、合理过期时间 |
| HTTPS | 全站SSL、HSTS头 |
| 防火墙 | 仅开放80/443端口 |
| 文件上传 | 限制大小10MB、限制类型 |
| 日志 | 定期清理、敏感信息脱敏 |
| 依赖 | 定期 `npm audit`、及时更新 |
| 备份 | 每日数据库备份（见下方） |

## 八、备份策略

### 数据库每日备份

```bash
# /opt/scripts/backup-db.sh
#!/bin/bash
BACKUP_DIR="/opt/backups/thepet"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u thepet -p'strong_password' thepet \
  | gzip > "$BACKUP_DIR/thepet_$DATE.sql.gz"

# 保留最近30天
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

设置 Cron：
```bash
# 每天凌晨3点备份
0 3 * * * /opt/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### 文件备份

```bash
# 每周同步 uploads 到备份目录
0 2 * * 0 rsync -av /opt/thepet/pet-server/uploads/ /opt/backups/uploads/
```

## 九、监控与日志

### PM2 监控

```bash
pm2 monit              # 实时监控
pm2 logs pet-server    # 查看日志
pm2 status             # 查看状态
```

### 日志轮转

```bash
# PM2 日志自动轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 30
```

### 健康检查

```bash
# API 健康检查
curl http://localhost:3000/api/health

# 在 Nginx 中配置健康检查端点
# /api/health → 200 OK = 服务正常
```

## 十、更新部署流程

```bash
# 1. 拉取最新代码
cd /opt/thepet
git pull origin master

# 2. 更新后端
cd pet-server
npm install --production
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 reload pet-server

# 3. 更新管理端
cd ../pet-admin
npm install --production
npm run build

# 4. 验证
curl http://localhost:3000/api/health
```

## 十一、常见运维操作

```bash
# 查看服务状态
pm2 status

# 重启服务
pm2 reload pet-server

# 查看实时日志
pm2 logs pet-server --lines 100

# 数据库连接检查
npx prisma db pull --force  # 仅测试连接

# Redis 连接检查
redis-cli -a your_password ping

# 磁盘空间检查
df -h
du -sh /opt/thepet/pet-server/uploads/
```

---

**文档版本**: v1.0  
**生成日期**: 2026-05-10  
**适用范围**: thePet 后端/管理端生产部署
