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
    ├── App.jsx                  # Routes + layout (Navbar)
    ├── index.css                # CSS override
    ├── api/
    │   └── axios.js             # Axios instance + JWT interceptor
    ├── pages/
    │   ├── customer/Home.jsx
    │   ├── admin/Dashboard.jsx
    │   └── staff/POS.jsx
    ├── components/              # Shared UI components (team tự thêm)
    ├── hooks/                   # useAuth, useCart, ...
    ├── context/                 # AuthContext, CartContext
    └── utils/                   # Format currency, date, ...
```

## Convention

- **Component** dùng functional + hooks (không class).
- **Naming**: PascalCase cho component file (`ProductCard.jsx`), camelCase cho hook (`useAuth.js`), camelCase cho util (`formatCurrency.js`).
- **API call**: luôn qua `src/api/axios.js`, không tạo axios instance riêng từng nơi.
- **State**: dùng `useState` / `useReducer` + Context cho global. Không thêm Redux/Zustand cho dự án nhỏ này.
- **CSS**: ưu tiên class util của Bootstrap. Style riêng đặt trong `index.css` hoặc CSS module.
