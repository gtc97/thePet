# thePet 开发环境搭建指南

## 一、环境要求总览

| 依赖 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | 18+ (推荐22 LTS) | 后端 + 管理端运行时 |
| MySQL | 8.0+ | 数据库 |
| Redis | 7.x | 缓存（可优雅降级） |
| Java JDK | 21 LTS | 部分工具链/脚本 |
| Python | 3.12+ | 脚本/工具链 |
| Git | 2.x | 版本管理 |

## 二、Node.js 安装

```bash
# 方式一：nvm（推荐，已安装）
nvm install 22.14.0
nvm use 22.14.0

# 方式二：官网下载
# https://nodejs.org/ 下载 LTS 版本安装
```

验证：
```bash
node -v   # v22.14.0
npm -v    # 10.x
```

## 三、MySQL 安装

Windows 推荐使用 MySQL Installer 或解压版：

```bash
# 下载地址
# https://dev.mysql.com/downloads/mysql/8.0.html

# 安装到 D:\mysql\
# 初始化数据库
mysqld --initialize --console

# 创建项目数据库
mysql -u root -p
CREATE DATABASE thepet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 四、Redis 安装

```bash
# Windows 可使用 Memurai（Redis Windows 兼容版）
# https://www.memurai.com/

# 或通过 WSL/Docker 运行
docker run -d -p 6379:6379 redis:7-alpine

# 开发环境下 Redis 非必须，系统会优雅降级
```

## 五、Java JDK 21 安装

```bash
# 下载 Eclipse Temurin JDK 21
# 清华镜像（国内推荐）：
# https://mirrors.tuna.tsinghua.edu.cn/Adoptium/21/jdk/x64/windows/

# 解压到 D:\Java\jdk-21\
# 配置环境变量：
JAVA_HOME = D:\Java\jdk-21
PATH += D:\Java\jdk-21\bin
```

验证：
```bash
java -version   # OpenJDK 21.0.11 LTS
javac -version  # javac 21.0.11
```

## 六、Python 安装

```bash
# 下载地址
# https://www.python.org/downloads/

# 安装到 D:\python\
# 配置环境变量：
PATH += D:\python
PATH += D:\python\Scripts
```

验证：
```bash
python --version   # Python 3.14.3
pip --version      # pip 24.x
```

## 七、项目启动

### 1. 克隆项目

```bash
git clone <repo-url> thePet
cd thePet
```

### 2. 后端 (pet-server)

```bash
cd pet-server
npm install

# 配置环境变量（复制模板修改）
cp ../.env.example .env
# 编辑 .env，填写 DATABASE_URL、JWT_SECRET 等

# 数据库迁移
npx prisma migrate dev --name init
npx prisma generate

# 启动开发服务器
npm run dev
# → http://localhost:3000
```

### 3. 管理端 (pet-admin)

```bash
cd pet-admin
npm install

# 启动开发服务器
npm run dev
# → http://localhost:5173
```

### 4. 用户端 (pet-app)

用户端使用 UniApp X，需要用 HBuilderX 打开编译：

```bash
# 1. 下载 HBuilderX：https://www.dcloud.io/hbuilderx.html
# 2. 安装到 D:\HBuilderX\
# 3. 用 HBuilderX 打开 pet-app 目录
# 4. 运行 → 微信小程序 / Android / iOS
```

## 八、环境变量参考

详见项目根目录 `.env.example`，关键变量：

| 变量 | 说明 | 开发环境默认 |
|------|------|-------------|
| DATABASE_URL | MySQL 连接 | mysql://root:password@localhost:3306/thepet |
| JWT_SECRET | JWT 签名密钥 | 随意字符串 |
| REDIS_URL | Redis 连接 | redis://localhost:6379 |
| PORT | 服务端口 | 3000 |

## 九、常见问题

### Q: Prisma 连接 MySQL 失败？
确认 MySQL 服务已启动，`DATABASE_URL` 格式正确，数据库 `thepet` 已创建。

### Q: npm install 很慢？
配置国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

### Q: Redis 未安装导致报错？
系统已做优雅降级处理，Redis 不可用时不会阻塞。部分功能（短信频率限制等）会跳过。

### Q: HBuilderX 无法启动？
确认已安装到 `D:\HBuilderX\`，如路径不同需在设置中调整。

---

**文档版本**: v1.0  
**生成日期**: 2026-05-10
