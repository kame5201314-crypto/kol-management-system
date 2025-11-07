import jwt from 'jsonwebtoken';

// JWT 驗證中間件
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供認證令牌'
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production');
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: '無效的認證令牌'
    });
  }
};

// 檢查管理員權限
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: '需要管理員權限'
    });
  }
};

// 檢查用戶權限（管理員或一般用戶）
export const requireUser = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'user')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: '需要用戶權限'
    });
  }
};
