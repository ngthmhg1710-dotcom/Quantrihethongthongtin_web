
# Modern B2C E-commerce Website (Node.js)

Project web ban hang dua tren giao dien co san (React + Vite) va backend Node.js (Express).
#Tai khoan
+Admin: jwtadmin@example.com 
pass : abc12345
+Nguoi dung: ngthmhg1710@gmail.com
pass: 123456
## Chay du an

1. Cai dependency cho tung phan:
   - `npm install --prefix client`
   - `npm install --prefix server`
2. Cai va chay MongoDB local (hoac dung MongoDB Atlas).
3. Tao file env cho server:
   - copy `server/.env.example` thanh `server/.env`
   - cap nhat `MONGODB_URI` neu can
4. Chay backend:
   - `npm run dev:server`
5. Chay frontend:
   - `npm run dev:client`

Frontend mac dinh chay o `http://localhost:5173`  
Backend mac dinh chay o `http://localhost:5000`

## API backend da co

- `GET /api/health` - Kiem tra server
- `GET /api/products` - Lay danh sach san pham
- `GET /api/products/:id` - Lay chi tiet san pham theo id
- `POST /api/auth/register` - Dang ky tai khoan (luu MongoDB)
- `POST /api/auth/login` - Dang nhap tai khoan
- `GET /api/auth/me` - Kiem tra token va lay user hien tai (Bearer token)
- `POST /api/auth/refresh` - Lam moi access token bang refresh token
- `POST /api/auth/logout` - Thu hoi refresh token
- `GET /api/user/profile` - Route user can token
- `GET /api/user/orders` - Lay orders cua user dang nhap
- `POST /api/user/orders` - Tao order moi cho user dang nhap
- `GET /api/admin/users` - Route admin can token + role admin
- `GET /api/admin/orders` - Admin xem toan bo orders
- `PATCH /api/admin/orders/:id/status` - Admin cap nhat trang thai order
- `GET /api/admin/dashboard` - So lieu tong quan doanh thu/so don
- `GET /api/admin/categories` - Lay danh muc
- `POST /api/admin/categories` - Tao danh muc
- `PATCH /api/admin/categories/:id` - Sua danh muc
- `DELETE /api/admin/categories/:id` - Xoa danh muc
- `POST /api/admin/products` - Tao san pham
- `PATCH /api/admin/products/:id` - Sua san pham
- `DELETE /api/admin/products/:id` - Xoa san pham

## JWT auth

- Server tra ve `token` (access token) va `refreshToken` khi register/login.
- Frontend luu:
  - `app_token` (access token)
  - `app_refresh_token` (refresh token)
  - `app_user` (user info)
- Neu access token het han, frontend tu dong goi `POST /api/auth/refresh` de lay token moi.
- Can dat day du cac bien trong `server/.env`:
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `JWT_REFRESH_SECRET`
  - `JWT_REFRESH_EXPIRES_IN`

## Ghi chu MongoDB

- Backend dung `mongoose` de ket noi MongoDB.
- Lan dau chay server, neu collection `products` chua co du lieu thi he thong se tu seed san 4 san pham mau.

## Cau truc MVC backend

- `server/models` - Dinh nghia schema/model MongoDB
- `server/controllers` - Xu ly logic cho API
- `server/routes` - Dinh nghia endpoint
- `server/config` - Cau hinh env + ket noi database
- `server/app.js` - Cau hinh middleware va mount routes
- `server/server.js` - Khoi dong app
  