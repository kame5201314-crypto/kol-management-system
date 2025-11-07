import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

class AuthController {
  // 用戶登入
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '請提供用戶名和密碼'
        });
      }

      // 查詢用戶
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤'
        });
      }

      // 驗證密碼
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤'
        });
      }

      // 生成 JWT
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: '登入成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: '登入失敗',
        error: error.message
      });
    }
  }

  // 用戶註冊
  static async register(req, res) {
    try {
      const { username, email, password, fullName } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: '請提供完整的註冊資訊'
        });
      }

      // 檢查用戶是否已存在
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: '用戶名或電子郵件已存在'
        });
      }

      // 加密密碼
      const passwordHash = await bcrypt.hash(password, 10);

      // 建立新用戶
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, 'user')
         RETURNING id, username, email, full_name, role, created_at`,
        [username, email, passwordHash, fullName]
      );

      const newUser = result.rows[0];

      res.status(201).json({
        success: true,
        message: '註冊成功',
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            fullName: newUser.full_name,
            role: newUser.role
          }
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: '註冊失敗',
        error: error.message
      });
    }
  }

  // 獲取當前用戶資訊
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = $1',
        [userId]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到用戶'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: '獲取用戶資訊失敗',
        error: error.message
      });
    }
  }
}

export default AuthController;
