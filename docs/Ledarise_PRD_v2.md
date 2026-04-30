# Ledarise — 白人男士假发外贸商城
## 产品需求文档（PRD）v2.0

**品牌：Ledarise**
**目标市场：美国 / 英国 / 德国**
**文档版本：v2.0 | 更新日期：2026-04**

---

## 目录

1. [产品概述](#1-产品概述)
2. [用户角色](#2-用户角色)
3. [技术架构](#3-技术架构)
4. [数据库设计](#4-数据库设计)
5. [后端 API 设计](#5-后端-api-设计)
6. [前台功能需求](#6-前台功能需求)
7. [后台管理功能需求](#7-后台管理功能需求)
8. [数据导入模块](#8-数据导入模块)
9. [非功能需求](#9-非功能需求)
10. [项目结构](#10-项目结构)
11. [里程碑计划](#11-里程碑计划)

---

## 1. 产品概述

### 1.1 背景

Ledarise 是一个面向欧美（美国、英国、德国）白人男士群体的假发 / 发制品外贸 B2C 商城。现有业务已积累大量线下订单数据（Excel 格式），系统需将历史数据批量导入，并对外提供完整的前台购物流程和后台管理能力。

### 1.2 历史数据概况（基于已上传表格分析）

| 维度 | 数据 |
|------|------|
| 订单总量 | 9,027 条（均为 COMPLETE 状态） |
| 主要市场 | 美国 76.8% / 英国 17.3% / 德国 5.9% |
| 客单价区间 | $33.80 — $651.65 |
| SKU 类型 | EBP 系列、BRIGHT 系列、HOLLYWOOD 系列、HS 系列等 |
| 表格原始字段 | ID, Bill-to Name, Ship-to Address, Tel, Status, Grand Total (Base), Shipping Amount, SKU, Item Count, Country Id, Coupon Code, Purchase Date |

### 1.3 产品目标

- 为海外消费者提供专业、高端的假发购物体验
- 支持历史订单 Excel 批量导入，自动生成客户、产品、订单数据
- 提供高效的后台管理系统，覆盖产品、订单、客户、用户全链路

---

## 2. 用户角色

### 2.1 前台消费者

- 画像：欧美白人男士，25–65 岁，有假发/发制品需求
- 习惯：信用卡支付，注重品牌质感与购物体验
- 场景：浏览产品、对比规格、加入购物车、结算下单

### 2.2 后台管理员

| 角色 | 权限范围 |
|------|---------|
| Super Admin | 全部权限，含用户管理、系统配置 |
| Editor | 产品、订单、客户管理；不含用户管理 |

---

## 3. 技术架构

### 3.1 技术选型

| 层级 | 技术方案 | 说明 |
|------|---------|------|
| 前端框架 | **Next.js 14**（App Router） | SSR/SSG 混合渲染，SEO 友好 |
| 前端样式 | **Tailwind CSS + shadcn/ui** | 组件库统一风格，快速开发 |
| 前端状态 | Zustand | 购物车、用户 Session 全局状态 |
| 后端框架 | **Golang + Gin** | 高性能 HTTP 服务，轻量路由 |
| ORM | GORM | Golang 主流 ORM，支持 MySQL |
| 数据库 | **MySQL 8.0** | 主数据库 |
| 认证 | JWT（golang-jwt/jwt） | 后台管理员鉴权 |
| Excel 解析 | excelize（Go 库） | 解析 .xlsx 导入文件 |
| 文件存储 | 本地 /uploads 目录（可后期接 OSS） | 产品图片存储 |
| API 协议 | RESTful JSON API | 前后端分离 |
| 跨域 | Gin CORS 中间件 | 前端 Next.js 与后端分离部署 |

### 3.2 系统架构图

```
┌──────────────────────────────────────────────┐
│                  客户端 Browser               │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│         Next.js 14（前台 + 后台 Admin）        │
│   /app/...          /app/admin/...            │
│   Tailwind CSS + shadcn/ui + Zustand          │
└────────────┬─────────────────────────────────┘
             │ HTTP REST API（JSON）
             │ Authorization: Bearer <JWT>
┌────────────▼─────────────────────────────────┐
│           Golang Gin API Server               │
│  ┌────────────────────────────────────────┐  │
│  │  Router → Middleware → Handler → GORM  │  │
│  │  /api/v1/...  (公开接口)               │  │
│  │  /api/admin/... (JWT 鉴权接口)         │  │
│  └────────────────────────────────────────┘  │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│             MySQL 8.0 数据库                  │
│  customers / products / orders /             │
│  order_items / addresses / admin_users        │
└──────────────────────────────────────────────┘
```

### 3.3 目录结构

#### 后端（Go + Gin）

```
ledarise-backend/
├── main.go
├── config/
│   └── config.go            # 读取环境变量（DB、JWT_SECRET 等）
├── database/
│   └── mysql.go             # GORM 初始化 & AutoMigrate
├── middleware/
│   ├── auth.go              # JWT 验证中间件
│   ├── cors.go              # CORS 中间件
│   └── logger.go            # 请求日志
├── models/
│   ├── admin_user.go
│   ├── customer.go
│   ├── product.go
│   ├── order.go
│   └── order_item.go
├── handlers/
│   ├── auth.go              # 登录 / 刷新 Token
│   ├── products.go
│   ├── orders.go
│   ├── customers.go
│   ├── admin_users.go
│   ├── dashboard.go
│   └── import.go            # Excel 导入
├── services/
│   ├── import_service.go    # 解析 Excel、事务写入
│   └── product_service.go
├── router/
│   └── router.go            # 路由注册
├── utils/
│   ├── jwt.go
│   ├── response.go          # 统一响应结构
│   └── excel.go             # excelize 工具函数
├── uploads/                 # 产品图片本地存储
├── go.mod
└── go.sum
```

#### 前端（Next.js 14）

```
ledarise-frontend/
├── app/
│   ├── (store)/             # 前台路由组
│   │   ├── page.tsx         # 首页
│   │   ├── shop/
│   │   │   └── page.tsx     # 产品列表
│   │   ├── product/
│   │   │   └── [id]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── order-success/page.tsx
│   ├── admin/               # 后台路由组
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── users/page.tsx
│   ├── api/                 # Next.js API Route（可选，用于代理）
│   └── layout.tsx
├── components/
│   ├── store/               # 前台组件
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartDrawer.tsx
│   │   └── CheckoutSteps.tsx
│   ├── admin/               # 后台组件
│   │   ├── Sidebar.tsx
│   │   ├── DataTable.tsx
│   │   ├── ImportDialog.tsx
│   │   └── Charts.tsx
│   └── ui/                  # shadcn/ui 组件（自动生成）
├── lib/
│   ├── api.ts               # Axios 封装（baseURL + 拦截器）
│   ├── auth.ts              # JWT 存储 & 解析
│   └── utils.ts
├── store/
│   ├── cart.ts              # Zustand 购物车状态
│   └── auth.ts              # Zustand 管理员状态
├── types/
│   └── index.ts             # TypeScript 接口定义
├── public/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 4. 数据库设计

### 4.1 ER 图（核心表关系）

```
admin_users
  └─ id, username, email, password_hash, role, is_active

customers
  ├─ id, name, email, phone, country, created_at
  └── addresses (1:N)
       └─ id, customer_id, address_line, city, state, zip, country, is_default

products
  ├─ id, name, sku(唯一), description, price, original_price
  ├─ category, color, length, material, stock, status, created_at
  └── product_images (1:N)
       └─ id, product_id, url, sort_order

orders
  ├─ id, order_no(唯一 PO编号), customer_id, status
  ├─ subtotal, shipping_amount, discount, grand_total
  ├─ shipping_method, coupon_code, note, purchased_at
  └── order_items (1:N)
       └─ id, order_id, product_id, sku, product_name, price, quantity, subtotal

      shipping_addresses (内嵌在 orders 表中，冗余存储)
       └─ ship_name, ship_phone, ship_address, ship_city, ship_state, ship_zip, ship_country
```

### 4.2 建表 DDL（MySQL）

```sql
-- 管理员用户表
CREATE TABLE admin_users (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50) NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role        ENUM('super_admin','editor') NOT NULL DEFAULT 'editor',
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 客户表
CREATE TABLE customers (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100),
  phone       VARCHAR(30),
  country     VARCHAR(50),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name_phone (name, phone)
);

-- 客户地址表
CREATE TABLE addresses (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id   BIGINT UNSIGNED NOT NULL,
  address_line  VARCHAR(255),
  city          VARCHAR(100),
  state         VARCHAR(100),
  zip           VARCHAR(20),
  country       VARCHAR(50),
  is_default    TINYINT(1) DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 产品表
CREATE TABLE products (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  sku            VARCHAR(100) NOT NULL UNIQUE,
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  category       VARCHAR(50),
  color          VARCHAR(50),
  length         VARCHAR(50),
  material       VARCHAR(50),
  stock          INT NOT NULL DEFAULT 0,
  status         ENUM('published','draft') NOT NULL DEFAULT 'draft',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sku (sku),
  INDEX idx_status (status)
);

-- 产品图片表
CREATE TABLE product_images (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 订单表
CREATE TABLE orders (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no         VARCHAR(50) NOT NULL UNIQUE,
  customer_id      BIGINT UNSIGNED,
  status           ENUM('pending','processing','complete','cancelled') NOT NULL DEFAULT 'pending',
  subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount         DECIMAL(10,2) NOT NULL DEFAULT 0,
  grand_total      DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_method  VARCHAR(50),
  coupon_code      VARCHAR(50),
  note             TEXT,
  -- 冗余收货地址（快照，防止客户地址变更影响历史订单）
  ship_name        VARCHAR(100),
  ship_phone       VARCHAR(30),
  ship_address     VARCHAR(255),
  ship_city        VARCHAR(100),
  ship_state       VARCHAR(100),
  ship_zip         VARCHAR(20),
  ship_country     VARCHAR(50),
  purchased_at     DATETIME,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_order_no (order_no),
  INDEX idx_status (status),
  INDEX idx_purchased_at (purchased_at)
);

-- 订单明细表
CREATE TABLE order_items (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     BIGINT UNSIGNED NOT NULL,
  product_id   BIGINT UNSIGNED,
  sku          VARCHAR(100) NOT NULL,
  product_name VARCHAR(200),
  price        DECIMAL(10,2) NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  subtotal     DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
```

---

## 5. 后端 API 设计

### 5.1 统一响应格式

```json
// 成功
{
  "code": 200,
  "message": "success",
  "data": { ... }
}

// 分页
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 9027,
    "page": 1,
    "page_size": 20
  }
}

// 失败
{
  "code": 400,
  "message": "SKU already exists",
  "data": null
}
```

### 5.2 路由总表

#### 公开接口（无需鉴权）—— 前台商城

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 管理员登录（返回 JWT） |
| GET  | `/api/v1/products` | 产品列表（支持分页、筛选、排序） |
| GET  | `/api/v1/products/:id` | 产品详情 |
| POST | `/api/v1/orders` | 前台下单 |
| GET  | `/api/v1/orders/:order_no` | 查询订单（by 订单号，前台用） |

#### 管理员接口（需 JWT）—— `/api/admin/`

**仪表盘**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/admin/dashboard/stats` | 汇总统计（订单数、收入、客户数、SKU数） |
| GET  | `/api/admin/dashboard/revenue-trend` | 近30天每日收入（`?days=30`） |
| GET  | `/api/admin/dashboard/country-dist` | 各国订单分布 |
| GET  | `/api/admin/dashboard/recent-orders` | 最新10条订单 |

**产品管理**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | `/api/admin/products` | 列表（`?page&page_size&keyword&status&category`） |
| POST   | `/api/admin/products` | 新建产品 |
| GET    | `/api/admin/products/:id` | 产品详情 |
| PUT    | `/api/admin/products/:id` | 编辑产品 |
| DELETE | `/api/admin/products/:id` | 删除产品 |
| DELETE | `/api/admin/products/batch` | 批量删除（body: `{ids:[...]}`） |
| POST   | `/api/admin/products/:id/images` | 上传产品图片（multipart/form-data） |
| DELETE | `/api/admin/products/:id/images/:image_id` | 删除图片 |

**订单管理**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | `/api/admin/orders` | 列表（`?page&keyword&status&country&start_date&end_date`） |
| GET    | `/api/admin/orders/:id` | 订单详情 |
| PUT    | `/api/admin/orders/:id/status` | 修改订单状态 |
| PUT    | `/api/admin/orders/:id/note` | 更新备注 |
| GET    | `/api/admin/orders/export` | 导出 Excel（当前筛选条件） |
| POST   | `/api/admin/orders/import` | 上传 Excel 导入历史订单 |
| GET    | `/api/admin/orders/import/:task_id` | 查询导入任务进度 |

**客户管理**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | `/api/admin/customers` | 列表（`?page&keyword&country`） |
| GET    | `/api/admin/customers/:id` | 客户详情（含地址 + 历史订单） |
| PUT    | `/api/admin/customers/:id` | 编辑客户信息 |

**管理员用户**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | `/api/admin/users` | 列表 |
| POST   | `/api/admin/users` | 新建管理员 |
| PUT    | `/api/admin/users/:id` | 编辑（仅 super_admin） |
| PUT    | `/api/admin/users/:id/password` | 重置密码（仅 super_admin） |
| PUT    | `/api/admin/users/:id/status` | 启用/禁用（仅 super_admin） |

### 5.3 关键接口示例

#### 产品列表请求

```
GET /api/v1/products?page=1&page_size=12&category=short&color=blonde&min_price=50&max_price=200&sort=price_asc
```

#### 前台下单请求体

```json
POST /api/v1/orders
{
  "customer": {
    "name": "David Van",
    "email": "david@example.com",
    "phone": "+1 778-228-2828"
  },
  "shipping_address": {
    "address_line": "416 Country Club",
    "city": "Griffin",
    "state": "Georgia",
    "zip": "30223",
    "country": "United States"
  },
  "shipping_method": "standard",
  "items": [
    { "product_id": 1, "sku": "EBP 12", "quantity": 1 }
  ],
  "coupon_code": ""
}
```

#### Excel 导入响应

```json
{
  "code": 200,
  "data": {
    "task_id": "import_20260429_abc123",
    "total_rows": 9027,
    "imported_orders": 8901,
    "imported_customers": 6841,
    "imported_products": 384,
    "skipped_rows": 126,
    "errors": [
      { "row": 45, "reason": "invalid date format" }
    ]
  }
}
```

### 5.4 Gin 中间件栈

```
请求进入
  ↓ cors.go       — 允许 Next.js 域名跨域
  ↓ logger.go     — 记录请求日志
  ↓ auth.go       — /api/admin/* 路由验证 JWT
  ↓ role.go       — 部分接口验证 super_admin 角色
  ↓ handler       — 业务逻辑
  ↓ response.go   — 统一格式响应
```

---

## 6. 前台功能需求

### 6.1 全局布局

- **Navbar**：Logo（LEDARISE）/ Home / Shop / About / Contact / 购物车图标（Zustand 状态驱动数量角标）
- **Footer**：品牌介绍 / 导航链接 / 联系方式 / 版权
- 字体：serif 展示字体（Cormorant Garamond）+ sans 正文（DM Sans）
- 色调：深色背景 + 金色品牌色（`#c9a96e`）

### 6.2 页面清单

#### P1 — 首页 `/`

| 区块 | 内容 |
|------|------|
| Hero Banner | 品牌 Slogan + Shop Now / Our Story 按钮，大背景图 |
| 品牌特色（3列） | Natural Look / Premium Quality / Secure Checkout |
| 分类导航 | All / Short / Medium / Long / Curly / Gray（点击过滤产品） |
| 热销产品（8个） | 调用 `GET /api/v1/products?sort=best_seller&page_size=8`，ProductCard 组件渲染 |
| 用户评价（Testimonials） | 3条静态数据（含头像、姓名、星级、评论内容） |
| Footer | - |

**Next.js 渲染策略**：首页 Hero + 静态内容用 SSG，产品列表用 ISR（revalidate: 3600）

#### P2 — 产品列表 `/shop`

| 功能 | 说明 |
|------|------|
| 左侧筛选栏 | 价格范围滑块（shadcn Slider）/ 发色 Checkbox / 发长 Checkbox / 材质 Radio |
| 产品网格 | 3列响应式，ProductCard 组件（图片/SKU/名称/价格/Add to Cart） |
| 排序下拉 | Newest / Price↑ / Price↓ / Best Seller（shadcn Select） |
| 分页 | 每页12条，shadcn Pagination 组件，URL 参数同步（`?page=2`） |
| URL 参数驱动 | 筛选条件写入 URL query string，支持分享与浏览器回退 |

**Next.js 渲染策略**：SSR（useSearchParams 读取筛选参数，服务端请求 API）

#### P3 — 产品详情 `/product/[id]`

| 区块 | 说明 |
|------|------|
| 图片区 | 主图 + 4张缩略图切换（无真实图时展示品牌占位图） |
| 产品信息 | 名称 / SKU / 价格（含划线原价） |
| 规格选择 | 颜色标签选择器 / 尺寸（如有） |
| 数量选择器 | +/- 按钮，最小值 1 |
| CTA 按钮 | Add to Cart（Zustand 写入）/ Buy Now（直接跳 Checkout）|
| 产品描述 | 富文本展示 |
| 特性标签 | 100% Hand-Tied / Natural Hairline / Breathable Cap（badge 样式） |
| 相关推荐 | 4个同分类产品，调用 API `?category=xxx&page_size=4` |
| 用户评分 | 模拟数据（4.5–5星，静态渲染） |

**Next.js 渲染策略**：SSG + `generateStaticParams`（构建时预渲染），fallback: 'blocking'

#### P4 — 购物车 `/cart`

| 功能 | 说明 |
|------|------|
| 购物车列表 | 图片 / 名称 / SKU / 单价 / 数量（可修改）/ 小计，Zustand 驱动 |
| 删除 / 清空 | 从 Zustand store 移除 |
| 优惠码 | 输入框 + Apply 按钮（前端校验格式，后端下单时校验有效性） |
| 订单摘要 | 小计 / 运费（选择前显示"calculated at checkout"）/ 合计 |
| Checkout 按钮 | 跳转 `/checkout` |
| Continue Shopping | 跳转 `/shop` |
| 空购物车状态 | 插图 + "Your cart is empty" + Shop Now 按钮 |

**说明**：购物车数据存储在 Zustand（localStorage 持久化），无需登录，无需后端接口。

#### P5 — 结算页 `/checkout`（三步式单页）

**Step 1 — 收货信息**

| 字段 | 规则 |
|------|------|
| First Name / Last Name | 必填 |
| Email | 必填，格式校验 |
| Phone | 必填 |
| Address Line 1 | 必填 |
| Address Line 2 | 选填 |
| City / State / ZIP Code | 必填 |
| Country | 下拉：United States / United Kingdom / Germany |

**Step 2 — 配送方式**

| 选项 | 运费 | 时效 |
|------|------|------|
| Standard Shipping | $25.00 | 5–10 business days |
| Express Shipping | $45.00 | 2–3 business days |

**Step 3 — 支付（信用卡模拟表单）**

| 字段 | 说明 |
|------|------|
| Card Number | 格式化输入（每4位空格分隔），Visa/MC 图标自动识别（根据首位数字） |
| Cardholder Name | 必填 |
| Expiry Date | MM/YY 格式，自动补斜杠 |
| CVV | 3位，带 Tooltip 说明 |
| 安全提示 | 🔒 Secured by 256-bit encryption（仅 UI 展示，非真实支付） |

**Place Order 行为**：
1. 前端校验所有字段
2. 调用 `POST /api/v1/orders` 提交订单（不传卡号等支付信息）
3. 成功跳转 `/order-success?order_no=PO00xxxxxxxx`

#### P6 — 订单成功 `/order-success`

- 订单号展示（from URL query）
- 感谢文案 + "A confirmation email will be sent shortly"
- 订单摘要（从上一步状态或 API 查询）
- Continue Shopping 按钮

---

## 7. 后台管理功能需求

**访问路径**：`/admin/*`
**鉴权**：Next.js middleware 检测 localStorage JWT，未登录重定向 `/admin/login`
**UI 框架**：shadcn/ui DataTable + Charts（Recharts）+ Form（react-hook-form + zod）

### 7.1 登录页 `/admin/login`

- 邮箱 + 密码表单
- 调用 `POST /api/v1/auth/login`，成功后 JWT 存入 localStorage
- 错误提示（shadcn Toast）

### 7.2 仪表盘 `/admin/dashboard`

| 区块 | 数据来源 |
|------|---------|
| 统计卡片（4个） | 总订单数 / 总收入 / 客户数 / 产品(SKU)数 |
| 30天收入折线图 | `GET /api/admin/dashboard/revenue-trend` |
| 国家分布柱状图 | `GET /api/admin/dashboard/country-dist` |
| 最近订单表格（10条） | `GET /api/admin/dashboard/recent-orders` |
| 快捷入口 | Add Product / Import Data（打开 Dialog）/ View All Orders |

### 7.3 产品管理 `/admin/products`

**列表页功能**：

| 功能 | 说明 |
|------|------|
| 数据表格 | 图片缩略图 / 产品名 / SKU / 价格 / 状态 Badge / 库存 / 操作 |
| 搜索 | 按名称或 SKU 实时搜索（debounce 300ms） |
| 筛选 | 分类下拉 / 状态下拉（Published / Draft / All） |
| 排序 | 表头点击排序（价格、创建时间） |
| 批量操作 | Checkbox 全选 / 批量删除（确认 Dialog） |
| 新建按钮 | 跳转 `/admin/products/new` |

**新建/编辑页**：

| 区块 | 字段 |
|------|------|
| 基本信息 | 产品名称（必填）/ SKU（必填，编辑时只读）/ 描述（Textarea）|
| 分类属性 | 分类 / 颜色 / 发长 / 材质（均为下拉 Select）|
| 价格库存 | 售价（必填）/ 原价（可选，用于划线）/ 库存数量 |
| 图片上传 | 拖拽上传（最多6张），预览缩略图，拖拽排序，调用图片上传接口 |
| 发布状态 | Published / Draft Toggle |
| 操作按钮 | Save / Cancel |

**表单验证**：react-hook-form + zod schema

### 7.4 订单管理 `/admin/orders`

**列表页**：

| 列 | 说明 |
|----|------|
| 订单号 | 可点击进入详情 |
| 客户名 | - |
| 国家 | 国旗 + 国家名 |
| 金额 | 格式化为 $xxx.xx |
| 状态 | Badge（颜色区分：complete=绿 / pending=黄 / processing=蓝 / cancelled=红）|
| 下单时间 | 格式化日期 |
| 操作 | View / 状态快改下拉 |

**筛选条件**：关键词（订单号/客户名）/ 状态 / 国家 / 时间范围（Date Picker）

**工具栏按钮**：
- **Export Excel**：调用 `GET /api/admin/orders/export`，带当前筛选参数，浏览器下载
- **Import Excel**：打开 ImportDialog 组件（见数据导入模块）

**订单详情页** `/admin/orders/[id]`：

| 区块 | 内容 |
|------|------|
| 订单头部 | 订单号 / 下单时间 / 状态修改下拉（实时保存）|
| 客户信息 | 姓名 / 电话 / 邮箱（跳转客户详情链接）|
| 收货地址 | 完整地址展示 |
| 产品明细表 | SKU / 产品名 / 单价 / 数量 / 小计 |
| 费用汇总 | 小计 / 运费 / 优惠 / 合计（粗体）|
| 备注 | Textarea 可编辑，Auto-save |

### 7.5 客户管理 `/admin/customers`

**列表页**：

| 列 | 说明 |
|----|------|
| 姓名 | 可点击进详情 |
| 电话 | - |
| 国家 | - |
| 订单数 | - |
| 累计消费 | - |
| 最后下单时间 | - |
| 操作 | View |

**客户详情页** `/admin/customers/[id]`：
- 基本信息卡片（姓名、电话、国家、注册时间）
- 地址列表（来自历史订单收货地址去重）
- 历史订单列表（shadcn DataTable，分页）

### 7.6 用户管理 `/admin/users`（仅 super_admin 可见）

| 功能 | 说明 |
|------|------|
| 列表 | 用户名 / 邮箱 / 角色 / 状态 / 操作 |
| 新建 | 用户名 / 邮箱 / 密码 / 角色（下拉）|
| 编辑 | 角色修改 |
| 重置密码 | 输入新密码确认 Dialog |
| 启用/禁用 | Toggle Switch，即时生效（被禁用账号的 JWT 请求返回 401）|

---

## 8. 数据导入模块

### 8.1 触发入口

- 后台订单列表页工具栏「Import Excel」按钮
- 仪表盘快捷入口「Import Data」按钮

### 8.2 导入流程（前端 ImportDialog）

```
Step 1: 选择文件
  └── 拖拽或点击上传 .xlsx 文件（限 50MB）
      ↓ 上传成功后展示文件名 + 行数预估

Step 2: 预览数据（前5行）
  └── 表格展示原始字段：ID / Bill-to Name / Ship-to Address / Tel / Status / Grand Total / SKU 等
      ↓ 确认字段映射无误

Step 3: 执行导入
  └── 调用 POST /api/admin/orders/import（multipart，上传文件）
  └── 后端异步处理，返回 task_id
  └── 前端轮询 GET /api/admin/orders/import/:task_id（每2秒）
  └── 展示进度条（已处理行 / 总行数）

Step 4: 导入结果
  └── 成功：新建客户数 / 新建产品数 / 新建订单数 / 跳过数
  └── 错误列表（行号 + 原因，可下载错误报告）
```

### 8.3 后端导入逻辑（Go import_service.go）

```
1. 使用 excelize 逐行读取 .xlsx
2. 字段映射：
   - ID                → orders.order_no
   - Bill-to Name      → customers.name
   - Ship-to Address   → 正则拆解 → orders.ship_address/city/state/zip/country
   - Tel               → customers.phone
   - Grand Total(Base) → orders.grand_total
   - Shipping Amount   → orders.shipping_amount
   - SKU               → products.sku + order_items.sku
   - Item Count        → order_items.quantity
   - Country Id        → orders.ship_country
   - Coupon Code       → orders.coupon_code
   - Purchase Date     → orders.purchased_at
   - Status            → orders.status（COMPLETE → complete）

3. 去重规则（MySQL UPSERT / 事先查询）：
   - 客户：按 name + phone UNIQUE 查询，存在则复用 customer_id
   - 产品：按 sku UNIQUE 查询，不存在则插入（price = grand_total - shipping，status=published）
   - 订单：按 order_no UNIQUE 查询，存在则跳过

4. 事务：每500行一个事务批量写入，失败回滚当批，记录错误行继续
5. 地址解析正则（示例）：
   "416 COUNTRY CLUB GRIFFIN, Georgia, 30223, united states"
   → ship_address="416 COUNTRY CLUB", city="GRIFFIN", state="Georgia", zip="30223", country="United States"
```

---

## 9. 非功能需求

### 9.1 性能

| 指标 | 目标 |
|------|------|
| 前台首屏加载（LCP） | < 3s（SSG/ISR 缓存） |
| API 响应时间（P95） | < 200ms（简单查询）/ < 1s（导入操作除外）|
| 产品列表分页 | 每页 12 条，LIMIT/OFFSET 查询 |
| Excel 导入吞吐 | 支持 9000+ 行，< 60s 完成 |
| 最大上传文件 | 50MB（Gin multipart 限制）|

### 9.2 安全性

| 项目 | 方案 |
|------|------|
| 管理员鉴权 | JWT（HS256），Token 有效期 24h，Refresh Token 7d |
| 密码存储 | bcrypt（cost=12）|
| SQL 注入防护 | 全程 GORM Prepared Statement，禁止裸 SQL 拼接 |
| 文件上传 | 校验 MIME Type（仅允许 image/* 和 .xlsx），文件名随机化（UUID）|
| CORS | Gin CORS 中间件白名单配置（仅允许前端域名）|
| 信用卡表单 | 纯前端 UI，不传输任何卡号数据到后端 |

### 9.3 代码规范

**Go 后端**：
- 统一使用 `utils/response.go` 的 `Success()` / `Error()` 包装响应
- Handler 只做参数绑定 + 调用 Service，业务逻辑在 Service 层
- 错误统一用 `fmt.Errorf("handler: %w", err)` 包装
- 环境变量通过 `.env` + `config.go` 注入，禁止硬编码

**Next.js 前端**：
- API 调用统一走 `lib/api.ts`（Axios 实例，自动附加 Authorization header）
- 表单统一使用 react-hook-form + zod schema 验证
- shadcn/ui 组件按需引入，禁止直接修改 `components/ui/` 下文件
- TypeScript 严格模式，所有接口数据必须有 `types/index.ts` 对应类型

### 9.4 环境变量（后端 .env）

```env
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=ledarise
DB_PASSWORD=your_password
DB_NAME=ledarise_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE_HOURS=24
JWT_REFRESH_EXPIRE_DAYS=7

# 服务
GIN_MODE=release
SERVER_PORT=8080
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=50

# CORS（前端地址）
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

```env
# 前端 .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## 10. 项目结构（完整）

```
ledarise/
├── backend/                    # Golang Gin 后端
│   ├── main.go
│   ├── .env
│   ├── go.mod
│   ├── go.sum
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   └── mysql.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── role.go
│   │   └── logger.go
│   ├── models/
│   │   ├── admin_user.go
│   │   ├── customer.go
│   │   ├── product.go
│   │   ├── order.go
│   │   └── order_item.go
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── dashboard.go
│   │   ├── products.go
│   │   ├── orders.go
│   │   ├── customers.go
│   │   ├── admin_users.go
│   │   └── import.go
│   ├── services/
│   │   ├── import_service.go
│   │   ├── product_service.go
│   │   └── order_service.go
│   ├── router/
│   │   └── router.go
│   ├── utils/
│   │   ├── jwt.go
│   │   ├── response.go
│   │   ├── excel.go
│   │   └── address_parser.go
│   └── uploads/
│
└── frontend/                   # Next.js 14 前端
    ├── app/
    │   ├── (store)/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── shop/page.tsx
    │   │   ├── product/[id]/page.tsx
    │   │   ├── cart/page.tsx
    │   │   ├── checkout/page.tsx
    │   │   └── order-success/page.tsx
    │   └── admin/
    │       ├── login/page.tsx
    │       ├── layout.tsx          # Admin layout（含鉴权检查）
    │       ├── dashboard/page.tsx
    │       ├── products/
    │       │   ├── page.tsx
    │       │   ├── new/page.tsx
    │       │   └── [id]/page.tsx
    │       ├── orders/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       ├── customers/
    │       │   ├── page.tsx
    │       │   └── [id]/page.tsx
    │       └── users/page.tsx
    ├── components/
    │   ├── store/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductGrid.tsx
    │   │   ├── FilterSidebar.tsx
    │   │   ├── CartSummary.tsx
    │   │   └── CheckoutSteps.tsx
    │   ├── admin/
    │   │   ├── Sidebar.tsx
    │   │   ├── Header.tsx
    │   │   ├── DataTable.tsx
    │   │   ├── ImportDialog.tsx
    │   │   ├── ProductForm.tsx
    │   │   ├── OrderDetail.tsx
    │   │   └── Charts/
    │   │       ├── RevenueTrend.tsx
    │   │       └── CountryBar.tsx
    │   └── ui/                    # shadcn/ui 自动生成，勿手改
    ├── lib/
    │   ├── api.ts
    │   ├── auth.ts
    │   └── utils.ts
    ├── store/
    │   ├── cart.ts
    │   └── auth.ts
    ├── types/
    │   └── index.ts
    ├── public/
    │   └── images/placeholder/
    ├── .env.local
    ├── tailwind.config.ts
    ├── components.json            # shadcn/ui 配置
    └── next.config.ts
```

---

## 11. 里程碑计划

| 阶段 | 主要任务 | 周期 |
|------|---------|------|
| **Phase 0** | 环境初始化：Go 模块 / MySQL 建表 / Next.js 项目 / shadcn 初始化 / API 联通测试 | Day 1–2 |
| **Phase 1** | 后端核心：GORM Models / CRUD Handlers / JWT 鉴权 / 路由注册 / 统一响应 | Week 1 |
| **Phase 2** | 数据导入：excelize 解析 / 地址拆解 / 去重逻辑 / 事务批量写入 / 进度查询接口 | Week 1–2 |
| **Phase 3** | 后台前端：登录页 / Dashboard（图表）/ 产品 CRUD / 订单管理 / 导入 Dialog | Week 2–3 |
| **Phase 4** | 前台商城：首页 / 产品列表（筛选分页）/ 详情页 / 购物车（Zustand）/ 结算 / 下单接口 | Week 3–4 |
| **Phase 5** | 整合联调：前后端接口对齐 / 错误边界 / Loading 状态 / Toast 通知 / 响应式适配 | Week 4–5 |
| **Phase 6** | 测试收尾：数据导入端到端测试（9027条）/ 安全检查 / 性能优化 / 自部署文档 | Week 5–6 |

---

## 附录：依赖清单

### Go 后端主要依赖

```
github.com/gin-gonic/gin             # HTTP 框架
gorm.io/gorm                         # ORM
gorm.io/driver/mysql                 # MySQL 驱动
github.com/golang-jwt/jwt/v5         # JWT
github.com/xuri/excelize/v2          # Excel 解析
github.com/joho/godotenv             # .env 读取
golang.org/x/crypto/bcrypt           # 密码哈希
github.com/google/uuid               # UUID 生成（文件名）
github.com/gin-contrib/cors          # CORS 中间件
```

### Next.js 前端主要依赖

```
next@14                  # 框架
react / react-dom
typescript
tailwindcss              # 样式
@shadcn/ui               # 组件库
axios                    # HTTP 客户端
zustand                  # 状态管理
react-hook-form          # 表单
zod                      # Schema 验证
recharts                 # 图表（Dashboard）
react-dropzone           # 拖拽上传
date-fns                 # 日期格式化
```

---

*文档版本：v2.0 | 技术栈：Golang Gin + Next.js 14 + Tailwind CSS + shadcn/ui + MySQL 8.0*

## Claude Desgin
- Fetch this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/rGr6Xhfo06OGKr9UPzbJjg?open_file=Ledarise.html
Implement: Ledarise.html
- 文件目录 ui-desgin/
