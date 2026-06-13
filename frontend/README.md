# Frontend — SBA301 Clothing Shop

React 18 + Vite 5 + React Router 6 + React-Bootstrap + Axios.

## Quick start

```bash
cd frontend
npm install                 # cài deps (lần đầu)
cp .env.example .env        # tạo env file, sửa VITE_API_BASE_URL nếu cần
npm run dev                 # chạy dev server tại http://localhost:5173
```

BE phải đang chạy ở http://localhost:8080/api (xem `../README.md` setup BE).

## Script

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Dev server với HMR |
| `npm run build` | Build production vào `dist/` |
| `npm run preview` | Serve thư mục `dist/` để kiểm tra build |
| `npm run lint` | Chạy ESLint |

## Cấu trúc

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── .env.example
└── src/
    ├── main.jsx                 # Entry point, mount React + BrowserRouter
    ├── index.css                # CSS override
    ├── app/
    │   ├── App.jsx              # Routes (bọc trong MainLayout)
    │   └── layout/MainLayout.jsx  # AppNavbar + <Outlet/> dùng chung
    ├── shared/                  # Dùng chung mọi feature
    │   ├── components/          # AppNavbar, StatusBadge, ...
    │   ├── services/axios.js    # Axios instance + JWT interceptor
    │   ├── utils/               # format, orderStatus
    │   └── mock/                # mock data tạm
    └── features/                # Mỗi feature: pages/ (+ components/, services/, hooks/)
        ├── auth/   home/   products/
        ├── cart/   orders/   pos/   dashboard/   audit-logs/
        └── reviews/             # + demo/
```

## Convention

- **Component** dùng functional + hooks (không class).
- **Naming**: PascalCase cho component file (`ProductCard.jsx`), camelCase cho hook (`useAuth.js`), camelCase cho util (`formatCurrency.js`).
- **API call**: luôn qua `src/shared/services/axios.js`, không tạo axios instance riêng từng nơi. Call API theo feature đặt trong `features/<x>/services/` (vd `cart.service.js`).
- **State**: dùng `useState` / `useReducer` + Context cho global. Không thêm Redux/Zustand cho dự án nhỏ này.
- **CSS**: ưu tiên class util của Bootstrap. Style riêng đặt trong `index.css` hoặc CSS module.
