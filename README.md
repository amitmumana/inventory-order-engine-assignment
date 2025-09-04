# Inventory + Order Engine Assignment

## ⚙️ How to Get Started

### Prerequisites

- Node.js (LTS version)
- A running PostgreSQL database instance

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with your database
connection string and a secret key for JWT.

```env
DATABASE_URL="postgresql://[user]:[password]@localhost:5432/[database]?schema=public"
JWT_SECRET="your_strong_and_random_jwt_secret_key"

```

Run Prisma migrations and seed the database:

```bash
npx prisma migrate dev --name init
npx prisma db seed

```

This will create: - **ADMIN** user: `admin@example.com` /
`adminpassword` - **USER**: `user@example.com` / `userpassword`

Start the backend development server:

```bash
npm run dev
```

Backend runs on <http://localhost:3000>.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on <http://localhost:5173>.

### Browse Products

Visit <http://localhost:5173> to view seeded products. Add items to your
cart without logging in.

### User Flow

1.  Sign up for a new account.
2.  Log in with your account or the seeded user account.
3.  Add items to your cart (saved in the database).
4.  Checkout with "Buy Now" to place an order.
5.  View orders on the "Orders" page.

### Admin Flow

1.  Log in with admin account: `admin@example.com` / `adminpassword`.
2.  Access the **Admin** dashboard link in the header.
3.  Manage product stock and update order statuses.

## 📈 What I did

**Frontend** :I used React with TypeScript and Tailwind CSS for styling. The UI is basic but meets the requirements. Both users and guests can explore products and add them to the cart. After login, the cart persists and syncs with the database. Role-based routing is implemented for admins (basic but functional). For state management, I used Zustand — a lightweight and popular alternative to Redux. I also added validation for input fields and inventory.

**Backend** : I used Express.js with TypeScript, PostgreSQL, and Prisma as the ORM. I added validations on the backend side as well.

## 🚀 What can be improved

**Frontend** : The UI can be more enriched and responsive. API response statuses can be handled better. Payment integration can be added, along with more product update options for admins.

**Backend** : Validation can be more robust using prebuilt libraries like Zod. Payment integration can be added. Advanced inventory, order tracking, and user profile features can also be implemented.
