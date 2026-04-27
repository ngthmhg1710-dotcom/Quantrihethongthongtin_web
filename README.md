# Modern B2C E-commerce Website (Node.js)

Project gồm frontend `React + Vite` và backend `Node.js + Express + MongoDB`.

## Yêu cầu môi trường

- Node.js 18+
- npm 9+
- MongoDB local (hoặc MongoDB Atlas)
- Docker (tuỳ chọn)

## Chạy local

1. Cài dependencies:
   - `npm install --prefix client`
   - `npm install --prefix server`
2. Tạo file env cho backend:
   - copy `server/.env.example` thành `server/.env`
   - cập nhật các biến cần thiết (ít nhất là `MONGODB_URI`, `JWT_*`)
3. Chạy backend:
   - `npm run dev:server`
4. Chạy frontend:
   - `npm run dev:client`

Mặc định:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Chạy bằng Docker

Tại thư mục gốc:

- `docker compose up --build`

Sau khi chạy:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`

Dừng container:
- `docker compose down`

## Cấu hình biến môi trường quan trọng

Trong `server/.env`:

- Database: `MONGODB_URI`
- Auth JWT: `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- Google login: `GOOGLE_CLIENT_ID`
- Email/SMTP (newsletter, contact, order confirmation):
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
  - `NEWSLETTER_FROM_EMAIL`, `NEWSLETTER_REPLY_TO`
  - `CONTACT_RECEIVER_EMAIL`

Trong `client/.env`:

- `VITE_GOOGLE_CLIENT_ID` (trùng với `GOOGLE_CLIENT_ID` phía server)

## Tài khoản test mặc định

Server sẽ tự seed 2 tài khoản nếu chưa tồn tại:

- Admin: `jwtadmin@example.com` / `abc12345`
- User: `ngthmhg1710@gmail.com` / `123456`

## Lỗi thường gặp

- Không kết nối được backend:
  - Kiểm tra backend đã chạy ở cổng `5000`
- Đăng nhập Google không hiện:
  - Kiểm tra `GOOGLE_CLIENT_ID` và `VITE_GOOGLE_CLIENT_ID`
  - Restart cả frontend/backend sau khi sửa env
- Không gửi được email:
  - Kiểm tra cấu hình SMTP trong `server/.env`
  - Với Gmail cần dùng App Password
  