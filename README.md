MODERN B2C E-COMMERCE WEBSITE (NODE.JS)

=====================================
1. GIỚI THIỆU
=====================================

Project gồm:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Atlas)

=====================================
2. YÊU CẦU
=====================================

- Node.js >= 18
- npm >= 9
- MongoDB Atlas (khuyên dùng)

=====================================
3. CHẠY LOCAL
=====================================

Bước 1: Cài dependencies

npm install --prefix client
npm install --prefix server

-------------------------------------

Bước 2: Cấu hình backend

Copy file:
server/.env.example -> server/.env

Sửa:

PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<db>

JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

-------------------------------------

Bước 3: Cấu hình frontend

File: client/.env

VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id

-------------------------------------

Bước 4: Chạy project

Backend:
npm run dev:server

Frontend:
npm run dev:client

-------------------------------------

Truy cập:

Frontend: http://localhost:5173
Backend:  http://localhost:5000

=====================================
4. DEPLOY EC2
=====================================

Bước 1: Backend .env

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<db>

-------------------------------------

Bước 2: Frontend .env

VITE_API_URL=http://<EC2_PUBLIC_IP>:5000

Ví dụ:
VITE_API_URL=http://3.104.106.28:5000

-------------------------------------

Bước 3: Chạy backend

cd server
npm start

-------------------------------------

Bước 4: Chạy frontend

cd client
npm run dev -- --host

-------------------------------------

Bước 5: Mở port EC2

Mở các port:

5000 (backend)
5173 (frontend)
22 (SSH)
80, 443 (web)

Source: 0.0.0.0/0

-------------------------------------

Truy cập:

http://<EC2_PUBLIC_IP>:5173

=====================================
5. TÀI KHOẢN TEST
=====================================

Admin:
jwtadmin@example.com
abc12345

User:
ngthmhg1710@gmail.com
123456

=====================================
6. LỖI THƯỜNG GẶP
=====================================

1. ERR_CONNECTION_REFUSED localhost:5000

Nguyên nhân:
Frontend đang gọi localhost

Fix:
Sửa client/.env:
VITE_API_URL=http://<EC2_IP>:5000

Restart frontend:
Ctrl + C
npm run dev -- --host

-------------------------------------

2. ECONNREFUSED 127.0.0.1:27017

Nguyên nhân:
Sai biến môi trường

Fix:
Dùng đúng:
MONGODB_URI=...

-------------------------------------

3. Cannot GET /

Không phải lỗi (backend không có route /)

-------------------------------------

4. Không login được

Nguyên nhân:
Chưa seed user

Fix:
Đổi database mới:
MONGODB_URI=.../new_db

-------------------------------------

5. Gọi API vẫn về localhost

Nguyên nhân:
Code bị hardcode localhost

Fix:
Tìm và sửa:
http://localhost:5000

=> đổi thành:
import.meta.env.VITE_API_URL

=====================================
7. GHI CHÚ
=====================================

- Vite chỉ đọc .env khi khởi động
- Luôn restart sau khi sửa .env
- Backend và frontend phải chạy cùng lúc
- Không hardcode localhost

=====================================
8. NÂNG CAO
=====================================

Chạy backend nền:

npm install -g pm2
pm2 start index.js

-------------------------------------

Có thể thêm:
- Nginx
- Domain
- HTTPS