# KOL 管理系統 - 企業級部署與資安指南

## 📋 目錄
1. [雲端部署架構](#雲端部署架構)
2. [資料庫選擇與部署](#資料庫選擇與部署)
3. [資安防護措施](#資安防護措施)
4. [部署步驟](#部署步驟)
5. [監控與維護](#監控與維護)
6. [成本預估](#成本預估)

---

## 🏢 雲端部署架構

### 推薦架構圖

```
                          ┌─────────────────┐
                          │   用戶瀏覽器      │
                          └────────┬────────┘
                                   │ HTTPS
                                   ▼
┌──────────────────────────────────────────────────────┐
│                    CDN (內容分發)                      │
│              CloudFlare / AWS CloudFront             │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS + WAF
                     ▼
┌──────────────────────────────────────────────────────┐
│              前端託管 (靜態檔案)                        │
│        Vercel / Netlify / AWS S3 + CloudFront       │
└────────────────────┬─────────────────────────────────┘
                     │ API Calls (HTTPS)
                     ▼
┌──────────────────────────────────────────────────────┐
│                  API Gateway                         │
│              AWS API Gateway / Azure                 │
│              ├─ Rate Limiting                        │
│              ├─ Authentication                       │
│              └─ Request Validation                   │
└────────────────────┬─────────────────────────────────┘
                     │ Internal HTTPS
                     ▼
┌──────────────────────────────────────────────────────┐
│              後端應用伺服器                             │
│   AWS EC2 / Azure VM / Google Cloud Compute         │
│   ├─ Auto Scaling (自動擴展)                          │
│   ├─ Load Balancer (負載平衡)                         │
│   └─ Private Subnet (私有網路)                        │
└────────────────────┬─────────────────────────────────┘
                     │ Private Connection
                     ▼
┌──────────────────────────────────────────────────────┐
│              資料庫層 (私有網路)                        │
│   AWS RDS PostgreSQL / Azure Database               │
│   ├─ Primary (主資料庫)                               │
│   ├─ Standby (備援資料庫)                             │
│   ├─ Read Replicas (讀取副本)                        │
│   ├─ Automated Backup (自動備份)                     │
│   └─ Encryption at Rest (加密儲存)                   │
└──────────────────────────────────────────────────────┘
```

---

## 💾 資料庫選擇與部署

### 選項 1: AWS RDS PostgreSQL (推薦 ⭐⭐⭐⭐⭐)

#### 優點
- ✅ **完全託管** - AWS 負責維護、備份、更新
- ✅ **高可用性** - Multi-AZ 部署,自動故障轉移
- ✅ **自動備份** - 每日自動備份,保留 7-35 天
- ✅ **安全性** - VPC 隔離、加密儲存、IAM 整合
- ✅ **易擴展** - 隨時調整規格,無需停機
- ✅ **監控** - CloudWatch 完整監控

#### 部署配置
```yaml
資料庫規格建議:
  - 小型公司 (< 50 用戶):
      實例類型: db.t3.medium (2 vCPU, 4GB RAM)
      儲存空間: 100GB SSD
      成本: ~USD $70/月

  - 中型公司 (50-200 用戶):
      實例類型: db.m5.large (2 vCPU, 8GB RAM)
      儲存空間: 500GB SSD
      成本: ~USD $200/月

  - 大型公司 (> 200 用戶):
      實例類型: db.m5.xlarge (4 vCPU, 16GB RAM)
      儲存空間: 1TB SSD
      成本: ~USD $500/月

資安設定:
  - VPC: 私有子網路,不對外開放
  - Security Group: 僅允許應用伺服器連接
  - 加密: 啟用儲存加密 (AES-256)
  - SSL/TLS: 強制 SSL 連接
  - 備份: 每日自動備份,保留 30 天
  - Multi-AZ: 啟用多可用區部署
```

#### AWS RDS 設定步驟
```bash
# 1. 使用 AWS Console 建立 RDS
# 2. 或使用 AWS CLI

aws rds create-db-instance \
  --db-instance-identifier kol-management-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password [SECURE_PASSWORD] \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name private-subnet \
  --backup-retention-period 30 \
  --multi-az \
  --no-publicly-accessible
```

---

### 選項 2: Azure Database for PostgreSQL (推薦 ⭐⭐⭐⭐⭐)

#### 優點
- ✅ 完全託管服務
- ✅ 內建 AI 優化
- ✅ 自動備份和還原
- ✅ 彈性擴展
- ✅ 企業級安全性

#### 部署配置
```yaml
資料庫規格:
  - 基礎層 (小型):
      規格: 2 vCore, 4GB RAM
      成本: ~USD $80/月

  - 一般用途 (中型):
      規格: 4 vCore, 16GB RAM
      成本: ~USD $250/月

資安設定:
  - VNet 整合
  - 防火牆規則
  - SSL 強制連接
  - 進階威脅防護
  - 自動備份 (35天)
```

---

### 選項 3: Google Cloud SQL (推薦 ⭐⭐⭐⭐)

#### 優點
- ✅ Google 級別的基礎設施
- ✅ 自動備份和複製
- ✅ 高可用性配置
- ✅ 內建監控

#### 部署配置
```yaml
資料庫規格:
  - 標準: db-n1-standard-2
  - 成本: ~USD $100-150/月

資安設定:
  - Private IP
  - SSL 連接
  - IAM 認證
  - 自動備份
```

---

### 選項 4: 自建 PostgreSQL (不推薦 ⚠️)

#### 如果必須自建
```yaml
優點:
  - 完全控制
  - 成本較低(短期)

缺點:
  - 需要專業 DBA
  - 需要處理備份
  - 需要處理高可用性
  - 需要處理安全更新
  - 維護成本高

適用場景:
  - 有專業 IT 團隊
  - 資料不能出境
  - 特殊合規要求
```

---

## 🔐 資安防護措施

### 1. 網路層安全

#### 防火牆配置
```yaml
# 應用伺服器 Security Group
Inbound Rules:
  - HTTPS (443): 0.0.0.0/0  # 允許全部 HTTPS 流量
  - HTTP (80): 0.0.0.0/0    # 重定向到 HTTPS
  - SSH (22): YOUR_OFFICE_IP # 僅公司 IP 可 SSH

Outbound Rules:
  - All traffic to Database SG  # 可連接資料庫
  - HTTPS to internet           # API 呼叫

# 資料庫 Security Group
Inbound Rules:
  - PostgreSQL (5432): Application_SG_ID  # 僅應用伺服器

Outbound Rules:
  - None (或僅必要)
```

#### VPC 隔離
```
Public Subnet (DMZ):
  - Load Balancer
  - NAT Gateway

Private Subnet (Application):
  - Backend Servers
  - 無法直接從網際網路訪問

Private Subnet (Database):
  - RDS PostgreSQL
  - 無法從網際網路訪問
  - 僅應用層可連接
```

---

### 2. 應用層安全

#### 環境變數保護
```bash
# 使用 AWS Secrets Manager 或 Azure Key Vault
# 不要在代碼中寫入敏感資訊

# .env (生產環境 - 使用 Secrets Manager)
DB_HOST=${AWS_SECRET:DB_HOST}
DB_PASSWORD=${AWS_SECRET:DB_PASSWORD}
JWT_SECRET=${AWS_SECRET:JWT_SECRET}

# Node.js 代碼
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({
    SecretId: secretName
  }).promise();
  return JSON.parse(data.SecretString);
}
```

#### JWT 安全加固
```javascript
// backend/src/config/jwt.js
export const jwtConfig = {
  secret: process.env.JWT_SECRET, // 256-bit 隨機密鑰
  expiresIn: '2h',  // 短期 token
  refreshExpiresIn: '7d',
  algorithm: 'HS256',
  issuer: 'kol-management-system',
  audience: 'kol-api-users'
};

// 實現 Token Refresh 機制
// 每 2 小時過期,避免 token 被盜用
```

#### API Rate Limiting
```javascript
// backend/src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// 一般 API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 最多 100 次請求
  message: '請求過於頻繁,請稍後再試'
});

// 登入 API (更嚴格)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15分鐘內最多 5 次登入嘗試
  skipSuccessfulRequests: true,
  message: '登入嘗試次數過多,請 15 分鐘後再試'
});
```

#### SQL 注入防護
```javascript
// ✅ 正確做法 - 使用參數化查詢
const result = await pool.query(
  'SELECT * FROM kols WHERE name = $1',
  [userName]  // 自動跳脫
);

// ❌ 錯誤做法 - 字串拼接
const result = await pool.query(
  `SELECT * FROM kols WHERE name = '${userName}'`  // 危險!
);
```

#### XSS 防護
```javascript
// backend/src/middleware/security.js
import helmet from 'helmet';
import xss from 'xss-clean';

app.use(helmet()); // 設定安全的 HTTP Headers
app.use(xss()); // 清理用戶輸入

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));
```

---

### 3. 資料庫安全

#### 連接加密
```javascript
// backend/src/config/database.js
const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // 強制 SSL 連接
  ssl: {
    require: true,
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/rds-ca-certificate.pem')
  },

  // 連接池配置
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 敏感資料加密
```javascript
// 敏感欄位加密(如:身分證、信用卡)
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// 加密函數
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

// 解密函數
function decrypt(encrypted, iv, authTag) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

#### 資料庫備份策略
```yaml
自動備份:
  頻率: 每日凌晨 2:00
  保留期限: 30 天
  備份類型: 完整備份 + 事務日誌

手動備份:
  重大更新前: 手動建立快照
  保留: 至少 3 個月

災難恢復測試:
  頻率: 每季一次
  驗證: 完整還原測試
```

---

### 4. 認證與授權

#### 多因素認證 (MFA)
```javascript
// 建議使用 Google Authenticator 或 Authy

// backend/src/controllers/authController.js
import speakeasy from 'speakeasy';

// 啟用 MFA
static async enableMFA(req, res) {
  const secret = speakeasy.generateSecret({
    name: `KOL System (${req.user.email})`
  });

  // 儲存 secret 到資料庫
  await pool.query(
    'UPDATE users SET mfa_secret = $1 WHERE id = $2',
    [secret.base32, req.user.id]
  );

  // 回傳 QR Code
  res.json({
    success: true,
    qrCode: secret.otpauth_url
  });
}

// 驗證 MFA
static async verifyMFA(req, res) {
  const { token } = req.body;
  const user = await getUser(req.user.id);

  const verified = speakeasy.totp.verify({
    secret: user.mfa_secret,
    encoding: 'base32',
    token: token,
    window: 2
  });

  if (!verified) {
    return res.status(401).json({
      success: false,
      message: 'MFA 驗證碼錯誤'
    });
  }

  // 驗證成功,發放 token
  const jwtToken = generateToken(user);
  res.json({ success: true, token: jwtToken });
}
```

#### IP 白名單
```javascript
// backend/src/middleware/ipWhitelist.js
const allowedIPs = [
  '203.123.45.0/24',  // 公司 IP 範圍
  '10.0.0.0/8'         // 內網
];

export const ipWhitelist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  const isAllowed = allowedIPs.some(range => {
    return ipRangeCheck(clientIP, range);
  });

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: '存取被拒絕:IP 不在白名單中'
    });
  }

  next();
};

// 套用到敏感 API
app.use('/api/admin/*', ipWhitelist);
```

---

### 5. 日誌與監控

#### 存取日誌
```javascript
// backend/src/middleware/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // 所有日誌
    new winston.transports.File({
      filename: 'logs/combined.log'
    }),
    // 錯誤日誌
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // CloudWatch (生產環境)
    new winston.transports.CloudWatch({
      logGroupName: '/aws/kol-system/api',
      logStreamName: new Date().toISOString().split('T')[0]
    })
  ]
});

// 記錄所有 API 請求
app.use((req, res, next) => {
  logger.info({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });
  next();
});

// 記錄敏感操作
logger.warn({
  event: 'DELETE_KOL',
  userId: req.user.id,
  kolId: req.params.id,
  ip: req.ip
});
```

#### 異常偵測
```javascript
// 設定 AWS CloudWatch Alarms
const alarms = {
  // 錯誤率過高
  errorRate: {
    threshold: '5%',  // 超過 5% 錯誤率
    period: '5 minutes',
    action: 'Send SNS notification'
  },

  // 異常登入
  failedLogins: {
    threshold: 10,  // 5分鐘內 10 次失敗
    action: 'Block IP + Send alert'
  },

  // CPU/Memory 使用率
  cpuUsage: {
    threshold: '80%',
    action: 'Auto scaling + Alert'
  },

  // 資料庫連接數
  dbConnections: {
    threshold: '90% of max',
    action: 'Alert DBA'
  }
};
```

---

### 6. GDPR 與個資保護

#### 個資處理
```javascript
// 個資欄位標記
const personalDataFields = [
  'email',
  'phone',
  'id_number',  // 如果有
  'address'
];

// 個資存取日誌
async function logPersonalDataAccess(userId, dataType, accessor) {
  await pool.query(
    `INSERT INTO personal_data_access_log
     (user_id, data_type, accessed_by, accessed_at)
     VALUES ($1, $2, $3, NOW())`,
    [userId, dataType, accessor]
  );
}

// 個資刪除(Right to be forgotten)
async function deletePersonalData(userId) {
  await pool.query('BEGIN');

  try {
    // 匿名化而非刪除(保留統計)
    await pool.query(`
      UPDATE kols
      SET email = 'deleted@example.com',
          phone = 'DELETED',
          name = 'Deleted User',
          deleted_at = NOW()
      WHERE id = $1
    `, [userId]);

    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}
```

---

## 🚀 部署步驟

### 步驟 1: 準備雲端環境

#### AWS 部署
```bash
# 1. 建立 VPC 和子網路
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# 2. 建立 RDS 資料庫(如前所述)

# 3. 建立 EC2 實例
aws ec2 run-instances \
  --image-id ami-xxxxx \
  --instance-type t3.medium \
  --key-name your-key \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx

# 4. 設定 Application Load Balancer
aws elbv2 create-load-balancer \
  --name kol-system-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx
```

---

### 步驟 2: 部署後端

```bash
# SSH 到 EC2
ssh -i your-key.pem ec2-user@your-instance-ip

# 安裝 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安裝 PM2 (進程管理器)
sudo npm install -g pm2

# 部署代碼
git clone your-repo
cd backend
npm install --production

# 設定環境變數
cp .env.example .env
nano .env  # 編輯生產環境變數

# 執行資料庫遷移
npm run migrate

# 使用 PM2 啟動
pm2 start src/server.js --name kol-api
pm2 startup  # 開機自動啟動
pm2 save
```

---

### 步驟 3: 部署前端 (Vercel)

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
cd frontend
vercel --prod

# 設定環境變數(在 Vercel Dashboard)
VITE_API_URL=https://api.your-domain.com
```

---

### 步驟 4: 設定 HTTPS

```bash
# 使用 Let's Encrypt(免費 SSL)
sudo yum install -y certbot python3-certbot-nginx

# 取得憑證
sudo certbot --nginx -d api.your-domain.com

# 自動續期
sudo systemctl enable certbot-renew.timer
```

---

## 📊 監控與維護

### CloudWatch 監控設定

```javascript
// 設定監控指標
const metrics = {
  // API 回應時間
  apiResponseTime: {
    namespace: 'KOL-System',
    metricName: 'ResponseTime',
    unit: 'Milliseconds'
  },

  // 錯誤率
  errorRate: {
    namespace: 'KOL-System',
    metricName: 'ErrorRate',
    unit: 'Percent'
  },

  // 活躍用戶數
  activeUsers: {
    namespace: 'KOL-System',
    metricName: 'ActiveUsers',
    unit: 'Count'
  }
};

// 發送 metrics 到 CloudWatch
const cloudwatch = new AWS.CloudWatch();
await cloudwatch.putMetricData({
  Namespace: 'KOL-System',
  MetricData: [{
    MetricName: 'ResponseTime',
    Value: responseTime,
    Unit: 'Milliseconds',
    Timestamp: new Date()
  }]
}).promise();
```

---

## 💰 成本預估

### 小型公司 (<50 用戶)

| 項目 | 服務 | 規格 | 月成本 (USD) |
|------|------|------|-------------|
| 前端託管 | Vercel Pro | - | $20 |
| 後端伺服器 | AWS EC2 t3.medium | 2 vCPU, 4GB | $30 |
| 資料庫 | AWS RDS t3.medium | 2 vCPU, 4GB | $70 |
| CDN | CloudFlare Pro | - | $20 |
| 備份儲存 | S3 | 100GB | $5 |
| 監控 | CloudWatch | 基礎 | $10 |
| **月總計** | | | **$155** |
| **年總計** | | | **$1,860** |

### 中型公司 (50-200 用戶)

| 項目 | 月成本 (USD) |
|------|-------------|
| 前端 + CDN | $50 |
| 後端 (2 台 m5.large) | $180 |
| Load Balancer | $25 |
| 資料庫 (m5.large + Multi-AZ) | $300 |
| 備份與儲存 | $30 |
| WAF + Shield | $50 |
| 監控與日誌 | $30 |
| **月總計** | **$665** |
| **年總計** | **$7,980** |

### 大型公司 (>200 用戶)

| 項目 | 月成本 (USD) |
|------|-------------|
| 前端 (企業級 CDN) | $100 |
| 後端 (Auto Scaling 3-6 台) | $400 |
| 資料庫 (m5.2xlarge + Read Replicas) | $800 |
| 備份與災難恢復 | $100 |
| 安全服務 (WAF + Shield Advanced) | $200 |
| 監控與分析 | $100 |
| **月總計** | **$1,700** |
| **年總計** | **$20,400** |

---

## ✅ 安全檢查清單

### 部署前檢查

- [ ] 所有敏感資訊移至環境變數
- [ ] JWT_SECRET 使用強隨機密鑰
- [ ] 資料庫使用私有子網路
- [ ] 啟用 SSL/TLS 連接
- [ ] 設定防火牆規則
- [ ] 設定 Rate Limiting
- [ ] 安裝 Security Headers (Helmet.js)
- [ ] SQL 查詢使用參數化
- [ ] 實現 XSS 防護
- [ ] 設定 CORS 白名單
- [ ] 啟用資料庫自動備份
- [ ] 設定監控告警
- [ ] 準備災難恢復計畫
- [ ] 實現日誌記錄
- [ ] 通過安全掃描 (如 OWASP ZAP)

### 上線後維護

- [ ] 每週檢查日誌
- [ ] 每月安全更新
- [ ] 每季災難恢復演練
- [ ] 每季安全審計
- [ ] 監控異常活動
- [ ] 定期更新依賴套件
- [ ] 檢查 SSL 憑證有效期

---

## 🆘 緊急應變

### 資料洩露應變

```yaml
發現資料洩露時:
  1. 立即隔離:
     - 切斷受影響的伺服器
     - 封鎖可疑 IP

  2. 評估影響:
     - 確認洩露範圍
     - 識別受影響用戶

  3. 通知相關方:
     - 通知受影響用戶
     - 報告監管機關 (GDPR 72小時內)

  4. 修復漏洞:
     - 修補安全漏洞
     - 強制所有用戶重設密碼

  5. 事後檢討:
     - 分析根本原因
     - 改善安全措施
```

---

## 📞 支援資源

### 雲端服務支援
- AWS Support: https://aws.amazon.com/support/
- Azure Support: https://azure.microsoft.com/support/
- Google Cloud: https://cloud.google.com/support

### 資安資源
- OWASP Top 10: https://owasp.org/Top10/
- CWE Top 25: https://cwe.mitre.org/top25/
- NIST Cybersecurity: https://www.nist.gov/cyberframework

---

**最後更新**: 2024年3月20日
**版本**: 1.0.0
**作者**: KOL System Security Team
