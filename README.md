# 🛒 Modern B2C E-Commerce Website

Dự án Website Thương Mại Điện Tử B2C hiện đại, tập trung vào trải nghiệm người dùng (UI/UX) cùng đầy đủ tính năng cốt lõi cho Khách hàng và Quản trị viên.

=====================================
## 1. 🔗 THÔNG TIN BÁO CÁO (LINKS)
=====================================
- **GitHub Repo:** [https://github.com/ngthmhg1710-dotcom/Quantrihethongthongtin_web]
- **Figma Design:** [https://www.figma.com/design/Widn3Th6JGP7dLFdIjCLLY/Web-CK-QTHTTT?node-id=0-1&t=5SUzlI6ETCZwyHEM-1]

---

## 2. 🌐 TRẢI NGHIỆM BẰNG URL CÔNG KHAI

Cách nhanh nhất để xem và chấm điểm dự án là truy cập trực tiếp vào bản đã được Deploy (không cần cài đặt code):
- **Live Website:** [https://3-104-106-28.nip.io/](https://3-104-106-28.nip.io/)

---

## 3. 🐳 HƯỚNG DẪN CHẠY LOCAL BẰNG DOCKER

Dự án này được tối ưu và đóng gói hoàn toàn bằng Docker để đảm bảo có thể chạy mượt mà trên mọi môi trường (Local hoặc lúc Deploy lên Server/EC2) chỉ với 1 câu lệnh duy nhất.

### 3.1. Yêu cầu hệ thống
- Máy tính / Server đã cài đặt sẵn **Docker** và **Docker Compose**.

### 3.2. Cấu hình biến môi trường (.env)

Trước khi chạy Docker, bạn cần tạo 2 file `.env` cho Client và Server.

**A. Cấu hình cho Server (Backend)**
Tạo file `server/.env` (bạn có thể copy từ `.env.example`).
Lưu ý quan trọng: Khi chạy bằng file `docker-compose.yml` có sẵn, host kết nối Database phải là `mongo` (chứ không phải localhost).

```env
PORT=5000
MONGODB_URI=mongodb://mongo:27017/modern_b2c_ecommerce

# Xác thực JWT (Bắt buộc)
JWT_SECRET=chuoi_ky_tu_bi_mat_cua_ban
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=chuoi_ky_tu_bi_mat_refresh_cua_ban
JWT_REFRESH_EXPIRES_IN=30d

# Các biến tuỳ chọn khác (Google OAuth, SMTP Email...) bạn có thể xem chi tiết trong file .env.example
```

**B. Cấu hình cho Client (Frontend)**
Tạo file `client/.env`:

```env
# Địa chỉ API của Backend
VITE_API_URL=http://localhost:5000
```

### 3.3. Khởi chạy toàn bộ dự án
Mở terminal tại thư mục gốc của dự án (nơi chứa file `docker-compose.yml`) và chạy lệnh sau:

```bash
docker-compose up -d --build
```

Lệnh này sẽ tự động:
1. Tải image MongoDB.
2. Build image cho Node.js Backend.
3. Build image cho React Frontend.
4. Chạy và liên kết tất cả lại với nhau.

🎉 **Thành công!** Bạn có thể mở trình duyệt và truy cập:
- **Trải nghiệm Website (Frontend):** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

Để dừng ứng dụng, bạn chỉ cần gõ:
```bash
docker-compose down
```

### 3.4. Cập nhật bản chạy trên EC2 (production)

Trên EC2 dự án thường được clone về thư mục `~/Quantrihethongthongtin_web`, chạy **MongoDB** (Docker hoặc Atlas), **build Vite** ra `client/dist`, **Nginx** phục vụ `dist` và proxy `/api` tới Node (ví dụ PM2 trên cổng 5000). File `.github/workflows/deploy.yml` tự động cập nhật khi có push lên nhánh `main`.

**Cách 1 — GitHub Actions (khuyến nghị)**  
1. Đẩy code lên `main` trên repo GitHub (ví dụ [Quantrihethongthongtin_web](https://github.com/ngthmhg1710-dotcom/Quantrihethongthongtin_web)).  
2. Vào repo → **Actions** → workflow **Deploy to EC2** phải chạy xanh.  
3. Trong **Settings → Secrets and variables → Actions**, cấu hình tối thiểu: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`. Tuỳ chọn: `EC2_APP_DIR` (đường dẫn clone trên server; nếu bỏ trống sẽ dùng `~/Quantrihethongthongtin_web`).  
4. Có thể chạy tay workflow: **Actions** → **Deploy to EC2** → **Run workflow** (`workflow_dispatch`).

**Cách 2 — SSH vào EC2 và chạy lệnh** (cùng logic với CI):

```bash
cd ~/Quantrihethongthongtin_web   # hoặc đường dẫn clone của bạn
git fetch origin main
git reset --hard origin/main
git clean -fd --exclude=server/.env --exclude=client/.env --exclude='*.env'

cd client && (npm ci || npm install) && npm run build
cd ../server && (npm ci || npm install)
pm2 restart ecommerce-api --update-env || pm2 start index.js --name ecommerce-api
pm2 save || true
sudo nginx -t && sudo systemctl reload nginx || true
```

Đảm bảo Nginx `root` (hoặc `alias`) trỏ tới `client/dist` sau mỗi lần build. Nếu dùng toàn **Docker Compose** trên EC2 thay vì PM2, thay các lệnh `npm`/`pm2` bằng: `docker compose up -d --build` tại thư mục gốc dự án.

---

## 4. 🔑 TÀI KHOẢN TEST TRẢI NGHIỆM

Bạn có thể sử dụng các tài khoản dưới đây để trải nghiệm nhanh các tính năng ẩn trên website mà không cần phải đăng ký tài khoản mới:

**Tài khoản Quản trị (Admin Dashboard):**
- **Email:** `jwtadmin@example.com`
- **Mật khẩu:** `abc12345`
- *Phân quyền:* Truy cập trang Admin, xem biểu đồ doanh thu, thêm/sửa/xoá sản phẩm, danh mục, cập nhật trạng thái đơn hàng.

**Tài khoản Khách hàng (User Dashboard):**
- **Email:** `ngthmhg1710@gmail.com`
- **Mật khẩu:** `123456`
- *Phân quyền:* Trải nghiệm luồng mua sắm đầy đủ, xem lịch sử mua hàng, quản lý hồ sơ cá nhân và đánh giá sản phẩm.

---

## 5. 🌟 CÁC TÍNH NĂNG CHÍNH NỔI BẬT

- **Module Khách hàng:** 
  - Đăng ký/đăng nhập an toàn (Kết hợp Email/Password và Đăng nhập bằng Google).
  - Tìm kiếm & Lọc sản phẩm thông minh.
  - Quản lý Giỏ hàng và luồng Checkout thanh toán mượt mà.
  - Lịch sử đặt hàng và quản lý tài khoản (Dashboard cá nhân).
  - Chức năng đánh giá (Review) sản phẩm.
- **Module Quản trị (Admin):** 
  - Giao diện Tổng quan (Dashboard) thống kê dữ liệu.
  - Quản lý toàn diện Sản phẩm & Danh mục (CRUD).
  - Quản lý và theo dõi Đơn hàng của người dùng.

---

## 6. 🚀 CÔNG NGHỆ SỬ DỤNG
- **Frontend:** React, Vite, Tailwind CSS (Tích hợp Design System chuẩn mực)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Xác thực:** JWT (JSON Web Token) & Google OAuth 2.0