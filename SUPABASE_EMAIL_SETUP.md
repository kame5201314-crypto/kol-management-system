# Supabase Email 認證設定

## 關閉 Email 確認（開發階段）

為了方便測試，建議先關閉 Email 確認功能：

### 步驟：

1. 前往 https://supabase.com/dashboard
2. 選擇您的專案
3. 點擊左側選單的 **"Authentication"**
4. 點擊 **"Providers"**
5. 找到 **"Email"** provider
6. **關閉** "Confirm email" 選項
7. 點擊 **"Save"**

這樣註冊後就可以直接登入，不需要等待確認信！

## 測試帳號建立

完成設定後，可以直接在登入頁面：
1. 點擊 "還沒有帳號？點此註冊"
2. 輸入電子郵件和密碼
3. 立即登入使用

## 生產環境

上線前記得重新開啟 Email 確認功能以確保安全性！
