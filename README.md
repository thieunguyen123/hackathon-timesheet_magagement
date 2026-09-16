# Timesheet — Hệ thống chấm công & đơn từ

Quản lý chấm công + tạo/duyệt đơn **nghỉ phép (off)**, **remote**, **OT** với 3 role: `admin`, `manager` (quản lý), `user` (nhân viên).

## Tech stack

| Thành phần | Công nghệ |
|---|---|
| Backend | Laravel 12 (PHP 8.3), Sanctum token auth |
| Frontend | React 18 + Vite + React Router + Tailwind CSS 3 |
| Database | MySQL 8 |
| Chạy | Docker Compose (không cần cài PHP/MySQL trên máy) |

## Chạy dự án

Yêu cầu duy nhất: **Docker Desktop đang chạy**.

```bash
cd timesheet
docker compose up -d --build
```

> Nếu chạy trong WSL mà `docker` không có: dùng `docker.exe compose ...`, hoặc bật **Docker Desktop → Settings → Resources → WSL Integration → Ubuntu** để dùng `docker` trực tiếp.

Sau khi lên:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **MySQL**: `localhost:3307` (user `timesheet` / pass `secret`, db `timesheet`) — host port là **3307** để tránh đụng MySQL local

Container backend tự động: chờ MySQL → `migrate --seed` → serve. Lần đầu build mất vài phút (composer + npm).

### Tài khoản demo (mật khẩu đều là `password`)

| Email | Role |
|---|---|
| `admin@timesheet.dev` | admin |
| `manager@timesheet.dev` | quản lý (quản lý user1–4) |
| `user1..user4@timesheet.dev` | nhân viên |

## Chức năng

- **Auth & phân quyền**: login trả Sanctum token; middleware `role:admin,manager`
- **Chấm công**: đồng bộ từ Connecteam API — **không cần cấu hình**: thiếu API key thì hệ thống tự sinh dữ liệu demo (source `demo`); xem bảng công theo tháng dạng calendar (user xem của mình, quản lý xem team, admin xem tất cả); thống kê ngày công/tổng giờ/đi muộn/về sớm/OT
- **Đơn từ**: tạo đơn off/remote/ot → quản lý duyệt/từ chối (chỉ team mình, không tự duyệt) → admin duyệt tất cả; duyệt đơn `off` tự động trừ số dư phép (đếm ngày trong tuần)
- **Số dư phép theo giới tính** (`LeaveAccrualService`): nam tối đa 12 ngày/năm, tích lũy 1 ngày/tháng từ `start_date`; nữ tối đa 18 ngày/năm, 1.5 ngày/tháng. `entitlement = min(cap, số_tháng_đã_làm × rate)`, tính tự động mỗi lần đọc số dư
- **Thông báo trong app**: chuông ở topbar (trái khối user), badge số chưa đọc (poll 30s), dropdown cuộn được, click → điều hướng tới màn liên quan; sự kiện: đơn mới → báo manager + admin, duyệt/từ chối → báo người gửi
- **Toast alert**: mọi thông báo thành công/lỗi hiển thị dạng alert ở trên giữa màn hình (`ToastContext` + `useToast()`), tự tắt sau 4s
- **Dashboard**: thống kê theo role
- **Export Excel**: admin xuất bảng công & danh sách đơn (.xlsx)
- **Slack**: đơn mới → POST message lên channel (xem config bên dưới)

## Cấu hình tích hợp

Sửa `backend/.env` rồi `docker compose restart backend`:

```env
# Connecteam — để trống API key thì hệ thống sinh dữ liệu demo
CONNECTEAM_API_KEY=
CONNECTEAM_BASE_URL=https://api.connecteam.com
CONNECTEAM_TIMECLOCK_ID=

# Slack Incoming Webhook — để trống thì bỏ qua (chỉ log)
SLACK_WEBHOOK_URL=
```

- Đồng bộ chấm công thủ công: `POST /api/attendances/sync` (admin) hoặc `docker exec timesheet-backend php artisan connecteam:sync --days=30`
- Đã schedule `connecteam:sync` chạy mỗi giờ (trong `bootstrap/app.php`)
- Khi có API máy chấm công vân tay: viết service mới trong `app/Services/` theo mẫu `ConnecteamService` rồi đổi trong `AttendanceController@sync`

## API tóm tắt

```
POST /api/auth/login|logout, GET /api/auth/me
GET  /api/dashboard/stats
GET  /api/attendances?month=YYYY-MM&user_id=   POST /api/attendances/sync (admin/manager)
GET|POST /api/requests                         POST /api/requests/{id}/approve|reject (manager/admin)
GET  /api/leave-balance?user_id=&year=
GET  /api/notifications, GET /api/notifications/unread-count
POST /api/notifications/{id}/read, POST /api/notifications/read-all
GET  /api/team/users (manager/admin)
admin: apiResource /api/admin/users, GET /api/admin/export/timesheet|requests
```

## Cấu trúc

```
timesheet/
├── docker-compose.yml      # mysql:8 + backend + frontend(nginx)
├── backend/                # Laravel 12 API — controller mỏng, logic ở service
│   ├── app/Constants/      # AppConstants (giờ làm, nguồn chấm công...)
│   ├── app/Enums/          # Role, RequestType, RequestStatus
│   ├── app/Http/
│   │   ├── Controllers/    # chỉ điều phối: Request → Service → Resource
│   │   ├── Middleware/     # RoleMiddleware (role:admin,manager)
│   │   ├── Requests/       # FormRequest validation tiếng Việt
│   │   └── Resources/      # UserResource, AttendanceResource, ...
│   ├── app/Services/       # AttendanceService, LeaveRequestService,
│   │                       #   UserService, DashboardService,
│   │                       #   ConnecteamService, SlackService
│   ├── app/Support/        # DateHelper (đếm ngày trong tuần, đi muộn...)
│   ├── database/           # migrations + seeders (idempotent)
│   └── entrypoint.sh       # chờ mysql → sync env→.env → migrate --seed → serve
└── frontend/               # React 18 + Vite → nginx serve + proxy /api
    └── src/
        ├── api/            # client axios + module theo domain (authApi, requestApi...)
        ├── constants/      # ROUTES, REQUEST_TYPES, ROLES, WORK...
        ├── components/ui/  # Modal, Tabs, Avatar, StatusBadge, TypeChip, Pagination...
        ├── components/layout/ # Sidebar, Topbar, Layout, ProtectedRoute
        ├── context/        # AuthContext
        ├── hooks/          # useModal, useDebounce
        ├── pages/          # 7 trang
        └── utils/          # format.js, calendar.js
```

## Lệnh hữu ích

```bash
docker compose logs -f backend        # xem log
docker exec timesheet-backend php artisan tinker
docker compose down -v                # xóa cả DB volume (reset dữ liệu)
```
