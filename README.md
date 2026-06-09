# 🎨 Artisan Cooperative Marketplace

A full-stack web platform for artisans to sell handcrafted goods and run live auctions. Built with **React + Vite** on the frontend and **Node.js + Express + Prisma (SQLite)** on the backend, featuring real-time WebSocket-powered bidding.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛒 **Marketplace / Shop** | Browse handcrafted products by category (paintings, jewellery, pottery, textiles) |
| 🔨 **Auction House** | Real-time live auctions with WebSocket-powered bidding |
| 👤 **Role-based Access** | Three user roles: `CUSTOMER`, `ARTISAN`, `ADMIN` |
| 🧑‍🎨 **Artisan Dashboard** | Manage products, create auctions, track orders and revenue |
| 📦 **Customer Dashboard** | View order history, wishlist, and account details |
| 🛡️ **Admin Dashboard** | Platform-wide management and user oversight |
| ❤️ **Wishlist & Cart** | Save favourites and manage purchase flow |
| 🔒 **Auth & Security** | JWT authentication with bcrypt password hashing and account lockout |
| 🖼️ **Image Uploads** | Artisans can upload product/auction images via Multer |

---

## 🗂️ Project Structure

```
SE489/
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # All page components (Home, Catalog, AuctionHouse, etc.)
│   │   ├── components/   # Shared UI components (Navbar, etc.)
│   │   ├── context/      # AuthContext for global auth state
│   │   └── App.jsx       # Route definitions
│   └── package.json
│
└── server/               # Node.js + Express backend
    ├── routes/           # API route handlers (auth, product, auction, order, ...)
    ├── prisma/
    │   ├── schema.prisma # Database schema
    │   ├── seed.js       # Basic seed data
    │   └── mass_seed.js  # Large-scale seed data
    ├── websocket.js      # WebSocket logic for real-time auctions
    ├── index.js          # Server entry point
    └── .env              # Environment config (DATABASE_URL, JWT_SECRET)
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ → [Download](https://nodejs.org/)
- **npm** v9+ (comes with Node.js)

---

## 🚀 Setup & Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SE489
```

### 2. Set Up the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory (or edit the existing one) and ensure it has:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_key_here"
```

> **Note:** The `dev.db` SQLite database file is already included in the project. If it's missing or you want a fresh start, run the steps below.

Generate the Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push
```

*(Optional)* Seed the database with sample data:

```bash
node prisma/seed.js
# or for a larger dataset:
node prisma/mass_seed.js
```

### 3. Set Up the Client

Open a **new terminal** and run:

```bash
cd client
npm install
```

---

## ▶️ Running the App
First option: you can use the .bat file to launch everything
Alternative option:
You need **two terminals** running simultaneously — one for the server and one for the client.

### Terminal 1 — Start the Backend Server

```bash
cd server
node index.js
```

The API server will start at: **http://localhost:3001**

### Terminal 2 — Start the Frontend Dev Server

```bash
cd client
npm run dev
```

The website will be available at: **http://localhost:5173**

Open your browser and navigate to **http://localhost:5173** 🎉

---

## 🌐 Application Routes

| URL | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/shop` | Product Catalog | Public |
| `/auctions` | Auction House | Public |
| `/auction/:id` | Auction Detail + Live Bidding | Public |
| `/product/:id` | Product Detail | Public |
| `/artisans` | Browse Artisans | Public |
| `/cart` | Shopping Cart | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/wishlist` | Wishlist | Authenticated |
| `/dashboard/customer` | Customer Dashboard | `CUSTOMER` / `ARTISAN` / `ADMIN` |
| `/dashboard/artisan` | Artisan Dashboard | `ARTISAN` |
| `/dashboard/admin` | Admin Dashboard | `ADMIN` |

---

## 🔌 API Overview

The backend exposes the following REST API endpoints (all prefixed with `/api`):

| Prefix | Resource |
|---|---|
| `/api/auth` | Register, Login, JWT validation |
| `/api/products` | Product CRUD, image serving |
| `/api/auctions` | Auction management |
| `/api/orders` | Order creation and tracking |
| `/api/cart` | Cart management |
| `/api/wishlist` | Wishlist management |
| `/api/dashboard` | Artisan/Admin analytics |
| `/api/artisans` | Artisan profiles |
| `/api/upload` | Image file upload (Multer) |

WebSocket server runs on the same port (`3001`) for real-time auction bidding.

---

## 🗄️ Database

- **Database**: SQLite (via Prisma ORM)
- **File location**: `server/dev.db` and `server/prisma/dev.db`
- **Models**: `User`, `Profile`, `Product`, `Auction`, `Bid`, `Order`, `OrderItem`, `Review`, `Wishlist`, `Cart`, `CartItem`

To inspect the database visually:

```bash
cd server
npx prisma studio
```

This opens Prisma Studio in your browser at **http://localhost:5555**.

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite 8
- React Router DOM v7
- Recharts (dashboard charts)
- Lucide React (icons)
- Vanilla CSS

**Backend**
- Node.js + Express 5
- Prisma ORM + SQLite
- JSON Web Tokens (JWT)
- bcrypt (password hashing)
- Multer (file uploads)
- ws (WebSockets)

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| `CUSTOMER` | Browse, buy, bid, wishlist, manage cart, view orders |
| `ARTISAN` | Everything a customer can do + create/manage products & auctions, view sales analytics |
| `ADMIN` | Full platform access and user management |

To register as an **Artisan**, select the "Artisan" role during registration.

---

## 📝 License

This project was developed as part of **SE489** coursework.
