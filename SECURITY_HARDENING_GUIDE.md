# KOL 管理系統 - 資安強化實戰指南

## 🛡️ 目錄
1. [立即實施 (0成本)](#立即實施)
2. [進階防護 (低成本)](#進階防護)
3. [企業級防護 (投資級)](#企業級防護)
4. [實作代碼範例](#實作代碼範例)
5. [安全檢查工具](#安全檢查工具)
6. [應變計畫](#應變計畫)

---

## 🚨 立即實施 (0成本,30分鐘內完成)

### 1. 更新所有密鑰和密碼

#### 生成強隨機密鑰
```bash
# 生成 JWT Secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成加密密鑰 (AES-256)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成資料庫密碼
openssl rand -base64 32
```

#### 更新 .env
```bash
# backend/.env
JWT_SECRET=在此貼上剛生成的 64 字元 hex
ENCRYPTION_KEY=在此貼上剛生成的 64 字元 hex
DB_PASSWORD=在此貼上強密碼

# 密碼規則:
# - 至少 16 字元
# - 包含大小寫、數字、特殊符號
# - 不包含字典單字
# - 定期更換 (建議每 90 天)
```

---

### 2. 啟用 HTTP 安全標頭

#### 安裝並配置 Helmet.js
```bash
cd backend
npm install helmet
```

#### 更新 server.js
```javascript
// backend/src/server.js
import helmet from 'helmet';

// 基礎安全標頭
app.use(helmet());

// 進階配置
app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.your-domain.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },

  // HSTS - 強制 HTTPS
  hsts: {
    maxAge: 31536000, // 1 年
    includeSubDomains: true,
    preload: true
  },

  // 防止點擊劫持
  frameguard: {
    action: 'deny'
  },

  // 防止 MIME 類型嗅探
  noSniff: true,

  // XSS 過濾
  xssFilter: true,

  // 隱藏 X-Powered-By
  hidePoweredBy: true
}));
```

---

### 3. 實施 Rate Limiting (防止暴力攻擊)

#### 安裝套件
```bash
npm install express-rate-limit express-slow-down
```

#### 建立 Rate Limiter 中間件
```javascript
// backend/src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// 一般 API - 限制請求頻率
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 最多 100 次請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 根據 IP + User ID 限制
  keyGenerator: (req) => {
    return req.user?.id
      ? `${req.ip}-${req.user.id}`
      : req.ip;
  }
});

// 登入 API - 嚴格限制
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15 分鐘最多 5 次
  skipSuccessfulRequests: true, // 成功的不計入
  message: {
    success: false,
    message: '登入嘗試次數過多，請 15 分鐘後再試'
  }
});

// 註冊 API - 防止大量註冊
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 3, // 最多 3 次
  message: {
    success: false,
    message: '註冊次數已達上限，請稍後再試'
  }
});

// 漸進式減速 - 請求過多時降低速度
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50, // 50 次請求後開始減速
  delayMs: 500 // 每次延遲 500ms
});

// 敏感操作 - 刪除、更新密碼等
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 10,
  message: {
    success: false,
    message: '敏感操作過於頻繁'
  }
});
```

#### 套用到路由
```javascript
// backend/src/routes/authRoutes.js
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';

router.post('/login', loginLimiter, AuthController.login);
router.post('/register', registerLimiter, AuthController.register);

// backend/src/routes/kolRoutes.js
import { apiLimiter, sensitiveLimiter } from '../middleware/rateLimiter.js';

router.use(apiLimiter); // 套用到所有 KOL API
router.delete('/:id', sensitiveLimiter, KOLController.delete);
```

---

### 4. 輸入驗證和清理

#### 安裝驗證套件
```bash
npm install express-validator xss-clean
```

#### 建立驗證中間件
```javascript
// backend/src/middleware/validation.js
import { body, param, validationResult } from 'express-validator';
import xss from 'xss-clean';

// XSS 清理中間件
export const sanitizeInput = xss();

// 驗證錯誤處理
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '輸入資料驗證失敗',
      errors: errors.array()
    });
  }
  next();
};

// KOL 建立驗證規則
export const validateKOLCreate = [
  body('name')
    .trim()
    .notEmpty().withMessage('姓名不能為空')
    .isLength({ max: 100 }).withMessage('姓名不能超過 100 字元')
    .matches(/^[\u4e00-\u9fa5a-zA-Z\s]+$/).withMessage('姓名只能包含中英文'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email 格式不正確')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^09\d{2}-?\d{3}-?\d{3}$/).withMessage('電話格式不正確'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('評分必須在 0-5 之間'),

  body('categories')
    .isArray().withMessage('類別必須是陣列')
    .custom((value) => value.length > 0).withMessage('至少選擇一個類別'),

  body('socialPlatforms')
    .optional()
    .isArray()
    .custom((platforms) => {
      const validPlatforms = ['youtube', 'instagram', 'facebook', 'tiktok', 'twitter'];
      return platforms.every(p => validPlatforms.includes(p.platform));
    }).withMessage('無效的社群平台'),

  handleValidationErrors
];

// 登入驗證
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('用戶名不能為空')
    .isLength({ min: 3, max: 50 }).withMessage('用戶名長度 3-50 字元')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用戶名只能包含英文、數字、底線'),

  body('password')
    .notEmpty().withMessage('密碼不能為空')
    .isLength({ min: 8 }).withMessage('密碼至少 8 字元'),

  handleValidationErrors
];

// ID 參數驗證
export const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('無效的 ID'),

  handleValidationErrors
];
```

#### 套用驗證
```javascript
// backend/src/routes/kolRoutes.js
import { validateKOLCreate, validateId, sanitizeInput } from '../middleware/validation.js';

// 套用 XSS 清理到所有路由
router.use(sanitizeInput);

router.post('/', validateKOLCreate, KOLController.create);
router.put('/:id', validateId, validateKOLCreate, KOLController.update);
router.delete('/:id', validateId, KOLController.delete);
```

---

### 5. SQL 注入完全防護

#### 檢查並修正所有查詢
```javascript
// ❌ 危險 - 字串拼接
const query = `SELECT * FROM kols WHERE name = '${userName}'`;

// ✅ 安全 - 參數化查詢
const query = 'SELECT * FROM kols WHERE name = $1';
const result = await pool.query(query, [userName]);

// ✅ 安全 - 動態欄位也要白名單
const allowedSortFields = ['name', 'rating', 'created_at'];
const sortField = allowedSortFields.includes(req.query.sort)
  ? req.query.sort
  : 'created_at';

const query = `SELECT * FROM kols ORDER BY ${sortField} DESC`;
```

#### 建立安全查詢輔助函數
```javascript
// backend/src/utils/queryHelper.js

// 安全的欄位白名單
const ALLOWED_FIELDS = {
  kols: ['id', 'name', 'nickname', 'email', 'rating', 'created_at', 'updated_at'],
  collaborations: ['id', 'project_name', 'status', 'budget', 'start_date']
};

// 安全的 ORDER BY
export function safeOrderBy(table, field, direction = 'DESC') {
  if (!ALLOWED_FIELDS[table]?.includes(field)) {
    throw new Error('Invalid sort field');
  }

  const dir = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return `ORDER BY ${field} ${dir}`;
}

// 安全的 WHERE IN
export function safeWhereIn(field, values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Invalid values for WHERE IN');
  }

  const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
  return {
    clause: `${field} IN (${placeholders})`,
    values: values
  };
}

// 安全的分頁
export function safePagination(page = 1, limit = 20) {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  return {
    limit: limitNum,
    offset: offset
  };
}
```

---

### 6. 密碼安全強化

#### 強密碼策略
```javascript
// backend/src/utils/passwordPolicy.js
import zxcvbn from 'zxcvbn'; // 密碼強度檢查

export const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minStrengthScore: 3, // zxcvbn 評分 0-4

  // 禁用的常見密碼
  commonPasswords: [
    'password', '12345678', 'qwerty', 'admin', 'letmein',
    'welcome', 'monkey', '1234567890', 'password123'
  ]
};

export function validatePassword(password) {
  const errors = [];

  // 長度檢查
  if (password.length < passwordPolicy.minLength) {
    errors.push(`密碼至少需要 ${passwordPolicy.minLength} 字元`);
  }

  // 大寫字母
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密碼必須包含至少一個大寫字母');
  }

  // 小寫字母
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密碼必須包含至少一個小寫字母');
  }

  // 數字
  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('密碼必須包含至少一個數字');
  }

  // 特殊字元
  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密碼必須包含至少一個特殊字元');
  }

  // 常見密碼檢查
  if (passwordPolicy.commonPasswords.includes(password.toLowerCase())) {
    errors.push('此密碼過於常見，請選擇更強的密碼');
  }

  // 強度評分
  const strength = zxcvbn(password);
  if (strength.score < passwordPolicy.minStrengthScore) {
    errors.push(`密碼強度不足。建議: ${strength.feedback.suggestions.join('; ')}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    strength: strength.score,
    suggestions: strength.feedback.suggestions
  };
}
```

#### 密碼歷史記錄 (防止重複使用)
```javascript
// backend/src/models/passwordHistoryModel.js

// 新增資料表
CREATE TABLE password_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// 檢查密碼是否曾使用過
export async function checkPasswordHistory(userId, newPassword) {
  const history = await pool.query(`
    SELECT password_hash
    FROM password_history
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 5
  `, [userId]);

  for (const record of history.rows) {
    const isMatch = await bcrypt.compare(newPassword, record.password_hash);
    if (isMatch) {
      return {
        allowed: false,
        message: '不能使用最近 5 次的舊密碼'
      };
    }
  }

  return { allowed: true };
}

// 儲存密碼到歷史
export async function savePasswordHistory(userId, passwordHash) {
  await pool.query(`
    INSERT INTO password_history (user_id, password_hash)
    VALUES ($1, $2)
  `, [userId, passwordHash]);

  // 只保留最近 10 次
  await pool.query(`
    DELETE FROM password_history
    WHERE user_id = $1
    AND id NOT IN (
      SELECT id FROM password_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    )
  `, [userId]);
}
```

---

### 7. Session 管理強化

#### 實施 Refresh Token
```javascript
// backend/src/controllers/authController.js

static async login(req, res) {
  const { username, password } = req.body;

  // ... 驗證用戶 ...

  // 生成 Access Token (短期)
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // 15 分鐘
  );

  // 生成 Refresh Token (長期)
  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // 7 天
  );

  // 儲存 Refresh Token 到資料庫
  await pool.query(`
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '7 days')
  `, [user.id, refreshToken]);

  res.json({
    success: true,
    accessToken,
    refreshToken,
    expiresIn: 900 // 15 分鐘 = 900 秒
  });
}

// 刷新 Token
static async refreshToken(req, res) {
  const { refreshToken } = req.body;

  try {
    // 驗證 Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 檢查資料庫中是否存在
    const result = await pool.query(`
      SELECT * FROM refresh_tokens
      WHERE user_id = $1 AND token = $2 AND expires_at > NOW()
    `, [decoded.id, refreshToken]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token 無效或已過期'
      });
    }

    // 獲取用戶資料
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

    // 生成新的 Access Token
    const newAccessToken = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: 900
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token 驗證失敗'
    });
  }
}

// 登出 (撤銷 Refresh Token)
static async logout(req, res) {
  const { refreshToken } = req.body;

  await pool.query(`
    DELETE FROM refresh_tokens
    WHERE token = $1
  `, [refreshToken]);

  res.json({
    success: true,
    message: '已登出'
  });
}
```

#### Token 黑名單 (撤銷機制)
```javascript
// backend/src/models/tokenBlacklistModel.js

// 建立黑名單表
CREATE TABLE token_blacklist (
  id SERIAL PRIMARY KEY,
  token VARCHAR(500) UNIQUE,
  user_id INTEGER REFERENCES users(id),
  reason VARCHAR(100),
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

// 檢查 Token 是否在黑名單
export async function isTokenBlacklisted(token) {
  const result = await pool.query(`
    SELECT * FROM token_blacklist
    WHERE token = $1 AND expires_at > NOW()
  `, [token]);

  return result.rows.length > 0;
}

// 加入黑名單
export async function blacklistToken(token, userId, reason = 'logout') {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  await pool.query(`
    INSERT INTO token_blacklist (token, user_id, reason, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (token) DO NOTHING
  `, [token, userId, reason, expiresAt]);
}

// 撤銷用戶的所有 Token (強制登出)
export async function revokeAllUserTokens(userId, reason = 'security_incident') {
  // 刪除所有 Refresh Token
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

  // 記錄撤銷事件
  await pool.query(`
    INSERT INTO security_events (user_id, event_type, details)
    VALUES ($1, 'TOKEN_REVOCATION', $2)
  `, [userId, JSON.stringify({ reason })]);
}
```

---

### 8. 異常活動偵測

#### 建立安全事件日誌
```javascript
// backend/src/models/securityEventModel.js

// 建立安全事件表
CREATE TABLE security_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_type VARCHAR(50),
  severity VARCHAR(20), -- low, medium, high, critical
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);

// 記錄安全事件
export async function logSecurityEvent(event) {
  await pool.query(`
    INSERT INTO security_events
    (user_id, event_type, severity, ip_address, user_agent, details)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    event.userId,
    event.type,
    event.severity,
    event.ip,
    event.userAgent,
    JSON.stringify(event.details)
  ]);

  // 如果是高危事件,立即通知
  if (event.severity === 'high' || event.severity === 'critical') {
    await sendSecurityAlert(event);
  }
}

// 偵測異常登入
export async function detectAnomalousLogin(userId, ip, userAgent) {
  // 檢查過去 30 天的登入記錄
  const result = await pool.query(`
    SELECT DISTINCT ip_address, user_agent
    FROM security_events
    WHERE user_id = $1
    AND event_type = 'LOGIN_SUCCESS'
    AND created_at > NOW() - INTERVAL '30 days'
  `, [userId]);

  const knownIPs = result.rows.map(r => r.ip_address);
  const knownUserAgents = result.rows.map(r => r.user_agent);

  const anomalies = [];

  // 檢查 IP
  if (!knownIPs.includes(ip)) {
    anomalies.push('unknown_ip');
  }

  // 檢查 User Agent
  if (!knownUserAgents.includes(userAgent)) {
    anomalies.push('unknown_device');
  }

  // 檢查登入頻率
  const recentLogins = await pool.query(`
    SELECT COUNT(*) as count
    FROM security_events
    WHERE user_id = $1
    AND event_type = 'LOGIN_ATTEMPT'
    AND created_at > NOW() - INTERVAL '1 hour'
  `, [userId]);

  if (recentLogins.rows[0].count > 10) {
    anomalies.push('high_frequency');
  }

  return {
    isAnomalous: anomalies.length > 0,
    anomalies: anomalies
  };
}
```

#### 實施異常登入通知
```javascript
// backend/src/controllers/authController.js

static async login(req, res) {
  // ... 驗證成功 ...

  // 偵測異常
  const anomaly = await detectAnomalousLogin(
    user.id,
    req.ip,
    req.get('user-agent')
  );

  if (anomaly.isAnomalous) {
    // 記錄異常事件
    await logSecurityEvent({
      userId: user.id,
      type: 'ANOMALOUS_LOGIN',
      severity: 'medium',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        anomalies: anomaly.anomalies,
        timestamp: new Date()
      }
    });

    // 發送 Email 通知用戶
    await sendEmail({
      to: user.email,
      subject: '檢測到異常登入活動',
      template: 'anomalous-login',
      data: {
        userName: user.name,
        ip: req.ip,
        time: new Date(),
        location: await getLocationFromIP(req.ip),
        anomalies: anomaly.anomalies
      }
    });

    // 要求額外驗證
    return res.json({
      success: true,
      requireAdditionalAuth: true,
      message: '偵測到異常登入,請進行額外驗證',
      verificationMethod: 'email' // 或 'sms', 'totp'
    });
  }

  // 正常登入
  // ... 返回 token ...
}
```

---

### 9. 敏感資料加密

#### 欄位級加密 (Field-Level Encryption)
```javascript
// backend/src/utils/encryption.js
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

// 加密函數
export function encrypt(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // 返回: iv + authTag + encrypted (都是 hex)
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted: encrypted
  };
}

// 解密函數
export function decrypt(encryptedData) {
  const { iv, authTag, encrypted } = encryptedData;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// 雜湊函數 (單向,用於搜尋)
export function hashForSearch(text) {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}
```

#### 加密敏感欄位
```javascript
// backend/src/models/kolModel.js

// 建立加密欄位表
CREATE TABLE kol_sensitive_data (
  id SERIAL PRIMARY KEY,
  kol_id INTEGER REFERENCES kols(id) ON DELETE CASCADE,
  field_name VARCHAR(50),
  encrypted_value TEXT,
  iv VARCHAR(32),
  auth_tag VARCHAR(32),
  search_hash VARCHAR(64), -- 用於搜尋
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// 儲存加密資料
static async saveSensitiveData(kolId, fieldName, plainValue) {
  const { iv, authTag, encrypted } = encrypt(plainValue);
  const searchHash = hashForSearch(plainValue);

  await pool.query(`
    INSERT INTO kol_sensitive_data
    (kol_id, field_name, encrypted_value, iv, auth_tag, search_hash)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (kol_id, field_name)
    DO UPDATE SET
      encrypted_value = EXCLUDED.encrypted_value,
      iv = EXCLUDED.iv,
      auth_tag = EXCLUDED.auth_tag,
      search_hash = EXCLUDED.search_hash
  `, [kolId, fieldName, encrypted, iv, authTag, searchHash]);
}

// 讀取加密資料
static async getSensitiveData(kolId, fieldName) {
  const result = await pool.query(`
    SELECT encrypted_value, iv, auth_tag
    FROM kol_sensitive_data
    WHERE kol_id = $1 AND field_name = $2
  `, [kolId, fieldName]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return decrypt({
    encrypted: row.encrypted_value,
    iv: row.iv,
    authTag: row.auth_tag
  });
}

// 搜尋加密資料 (使用 hash)
static async searchSensitiveData(fieldName, searchValue) {
  const searchHash = hashForSearch(searchValue);

  const result = await pool.query(`
    SELECT kol_id FROM kol_sensitive_data
    WHERE field_name = $1 AND search_hash = $2
  `, [fieldName, searchHash]);

  return result.rows.map(r => r.kol_id);
}
```

---

### 10. CORS 嚴格配置

```javascript
// backend/src/server.js
import cors from 'cors';

const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // 允許沒有 origin 的請求 (如 Postman、移動應用)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: Origin ${origin} not allowed`;
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  },
  credentials: true, // 允許 cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'], // 允許前端讀取的自定義 header
  maxAge: 86400 // Preflight 快取 24 小時
}));
```

---

## 📝 完整檢查清單

將這份清單列印出來,逐項檢查:

```markdown
### 基礎安全 (必須完成)
- [ ] 所有密鑰已更新為強隨機值
- [ ] JWT_SECRET 使用 256-bit 隨機密鑰
- [ ] 資料庫密碼符合強密碼政策
- [ ] 已安裝並啟用 Helmet.js
- [ ] 已實施 Rate Limiting
- [ ] 已實施輸入驗證
- [ ] 所有查詢都使用參數化
- [ ] 已啟用 XSS 清理
- [ ] CORS 設定嚴格白名單
- [ ] 已隱藏 X-Powered-By header

### 進階安全 (強烈建議)
- [ ] 實施 Refresh Token 機制
- [ ] 實施 Token 黑名單
- [ ] 記錄所有安全事件
- [ ] 實施異常登入偵測
- [ ] 敏感欄位已加密
- [ ] 實施密碼歷史記錄
- [ ] 強制密碼複雜度政策
- [ ] 實施密碼過期機制 (90天)
- [ ] 設定 Session 超時 (15分鐘)
- [ ] 實施 CSRF 保護

### 企業級安全 (可選)
- [ ] 實施多因素認證 (MFA)
- [ ] 實施 IP 白名單
- [ ] 設定 WAF (Web Application Firewall)
- [ ] 實施 DDoS 防護
- [ ] 使用 HSM 管理密鑰
- [ ] 實施資料外洩偵測
- [ ] 設定 SIEM 集中日誌
- [ ] 定期滲透測試
- [ ] 購買資安保險
```

---

這份指南涵蓋了從基礎到企業級的所有資安措施。建議您先實施「立即實施」的 10 項,它們都是零成本且可以在 1-2 小時內完成的!

需要我詳細說明任何一個部分的實作嗎?