-- Seed Data for KOL Management System

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@kolsystem.com', '$2a$10$rXQjKVqGvY5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5', 'System Administrator', 'admin'),
('user1', 'user1@kolsystem.com', '$2a$10$rXQjKVqGvY5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5X5Z5', 'Regular User', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert sample KOLs
INSERT INTO kols (name, nickname, email, phone, region, categories, tags, languages, rating, notes) VALUES
('王美麗', '美麗姐', 'wangmeili@email.com', '0912-345-678', '台北',
 ARRAY['美妝', '時尚', '生活'], ARRAY['美妝教學', '穿搭', 'VLOG'], ARRAY['中文', '英文'], 4.8, '合作態度良好，粉絲互動率高'),

('林科技', 'Tech林', 'lintech@email.com', '0923-456-789', '新竹',
 ARRAY['3C', '科技', '開箱'], ARRAY['手機評測', '3C開箱', '科技新知'], ARRAY['中文'], 4.9, '專業3C評測，數據詳實'),

('陳美食', '美食獵人', 'chenfood@email.com', '0934-567-890', '台中',
 ARRAY['美食', '旅遊', '生活'], ARRAY['餐廳推薦', '美食探店', '旅遊'], ARRAY['中文', '台語'], 4.6, '在地美食專家，口碑佳'),

('張遊戲', 'Game張', 'zhanggame@email.com', '0945-678-901', '高雄',
 ARRAY['遊戲', '電競', '娛樂'], ARRAY['遊戲實況', '電競賽事', '遊戲攻略'], ARRAY['中文'], 4.7, '電競選手背景，粉絲黏著度高'),

('李健身', 'Fit Lee', 'lifitness@email.com', '0956-789-012', '台北',
 ARRAY['運動', '健身', '健康'], ARRAY['健身教學', '運動', '營養'], ARRAY['中文', '英文'], 4.9, '專業健身教練，內容專業')
ON CONFLICT DO NOTHING;

-- Insert social platform data
INSERT INTO social_platforms (kol_id, platform, url, followers, engagement_rate, average_views) VALUES
-- 王美麗
(1, 'youtube', 'https://youtube.com/@wangmeili', 280000, 8.5, 45000),
(1, 'instagram', 'https://instagram.com/wangmeili', 450000, 12.3, 35000),
(1, 'facebook', 'https://facebook.com/wangmeili', 120000, 6.8, 15000),

-- 林科技
(2, 'youtube', 'https://youtube.com/@techlin', 520000, 15.2, 85000),
(2, 'instagram', 'https://instagram.com/techlin', 180000, 9.8, 22000),

-- 陳美食
(3, 'instagram', 'https://instagram.com/chenfood', 320000, 11.5, 28000),
(3, 'facebook', 'https://facebook.com/chenfood', 250000, 8.9, 35000),
(3, 'tiktok', 'https://tiktok.com/@chenfood', 150000, 18.5, 55000),

-- 張遊戲
(4, 'youtube', 'https://youtube.com/@zhanggame', 680000, 14.2, 120000),
(4, 'tiktok', 'https://tiktok.com/@zhanggame', 420000, 16.8, 95000),
(4, 'instagram', 'https://instagram.com/zhanggame', 210000, 10.5, 25000),

-- 李健身
(5, 'youtube', 'https://youtube.com/@fitlee', 380000, 13.5, 65000),
(5, 'instagram', 'https://instagram.com/fitlee', 520000, 15.8, 42000)
ON CONFLICT DO NOTHING;

-- Insert sample collaborations
INSERT INTO collaborations (kol_id, project_name, brand_name, status, start_date, end_date, budget, actual_cost, deliverables, platforms, contract_url) VALUES
(1, '春季美妝系列推廣', 'BeautyBrand', 'in_progress', '2024-03-01', '2024-05-31', 180000, 150000,
 ARRAY['3支YouTube影片', '10則Instagram貼文', '5則限時動態'], ARRAY['youtube', 'instagram'],
 'https://contracts.example.com/contract1.pdf'),

(2, '旗艦手機深度評測', 'TechPhone', 'completed', '2024-01-15', '2024-02-28', 250000, 250000,
 ARRAY['1支開箱影片', '1支深度評測影片', '5則Instagram貼文'], ARRAY['youtube', 'instagram'],
 'https://contracts.example.com/contract2.pdf'),

(3, '餐廳開幕宣傳', 'Restaurant ABC', 'completed', '2024-02-01', '2024-02-15', 80000, 75000,
 ARRAY['2則Instagram貼文', '3則Facebook貼文', '1支TikTok影片'], ARRAY['instagram', 'facebook', 'tiktok'],
 'https://contracts.example.com/contract3.pdf'),

(4, '新遊戲上市推廣', 'GameStudio', 'in_progress', '2024-03-15', '2024-06-15', 350000, 280000,
 ARRAY['10場遊戲實況', '5支遊戲攻略影片', '15則TikTok短影片'], ARRAY['youtube', 'tiktok'],
 'https://contracts.example.com/contract4.pdf'),

(5, '運動品牌代言', 'SportsBrand', 'confirmed', '2024-04-01', '2024-12-31', 500000, NULL,
 ARRAY['12支健身教學影片', '24則Instagram貼文', '品牌活動出席'], ARRAY['youtube', 'instagram'],
 'https://contracts.example.com/contract5.pdf')
ON CONFLICT DO NOTHING;

-- Insert sales tracking data
INSERT INTO sales_tracking (kol_id, collaboration_id, discount_code, affiliate_link, clicks, conversions, revenue, commission_rate, commission_amount, tracking_start_date, tracking_end_date) VALUES
(1, 1, 'MEILI20', 'https://shop.example.com/ref=meili', 15200, 1850, 925000, 10, 92500, '2024-03-01', '2024-05-31'),
(2, 2, 'TECH15', 'https://shop.example.com/ref=techlin', 32500, 4200, 1680000, 8, 134400, '2024-01-15', '2024-02-28'),
(3, 3, 'FOOD10', 'https://booking.example.com/ref=chenfood', 5800, 680, 272000, 15, 40800, '2024-02-01', '2024-02-15'),
(4, 4, 'GAME25', 'https://gamestore.example.com/ref=zhanggame', 28900, 3850, 1925000, 12, 231000, '2024-03-15', '2024-06-15')
ON CONFLICT DO NOTHING;

-- Insert content performance data
INSERT INTO content_performance (collaboration_id, platform, content_type, post_url, post_date, views, likes, comments, shares, engagement_rate) VALUES
(1, 'youtube', 'video', 'https://youtube.com/watch?v=abc123', '2024-03-15', 85000, 6800, 420, 1200, 9.9),
(1, 'instagram', 'post', 'https://instagram.com/p/abc123', '2024-03-20', 45000, 5600, 320, 890, 15.1),
(2, 'youtube', 'video', 'https://youtube.com/watch?v=def456', '2024-01-20', 152000, 12500, 890, 2100, 10.2),
(3, 'tiktok', 'video', 'https://tiktok.com/@chenfood/video/123', '2024-02-05', 95000, 18500, 650, 3200, 23.5),
(4, 'youtube', 'stream', 'https://youtube.com/watch?v=ghi789', '2024-03-20', 125000, 15800, 2100, 1850, 15.8)
ON CONFLICT DO NOTHING;
