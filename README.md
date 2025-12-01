# Dine Dash

A multi-tenant restaurant ordering platform built with Next.js, Prisma, and TypeScript.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Language:** TypeScript

---

## API Routes

### Authentication

#### Admin Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/login` | Admin login with email/password |
| POST | `/api/auth/admin/logout` | Admin logout |
| GET | `/api/auth/admin/verify` | Verify admin session |

#### Staff Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/staff/login` | Staff login with email/password |
| POST | `/api/auth/staff/logout` | Staff logout |
| GET | `/api/auth/staff/verify` | Verify staff session |

#### OTP
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/otp/send` | Send OTP to phone number |
| POST | `/api/otp/verify` | Verify OTP and authenticate user |

---

### Restaurant Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/onboarding/register` | Register new restaurant |
| POST | `/api/onboarding/verify` | Verify email with OTP |
| POST | `/api/onboarding/complete` | Complete setup (branding, tables, taxes) |

---

### Menu Management

#### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories (query: `restaurantId`) |
| POST | `/api/categories` | Create new category |

#### Menu Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu-items` | Get all menu items (query: `restaurantId`, `categoryId`) |
| POST | `/api/menu-items` | Create new menu item |
| GET | `/api/menu-items/[id]` | Get single menu item |
| PUT | `/api/menu-items/[id]` | Update menu item (full) |
| PATCH | `/api/menu-items/[id]` | Update menu item (partial) |
| DELETE | `/api/menu-items/[id]` | Delete menu item |

---

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get orders (query: `restaurantId`, `status`, `phone`) |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/[id]` | Get single order (by ID or orderNumber) |
| PATCH | `/api/orders/[id]` | Update order status/payment |

---

### Tables

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tables` | Get all tables (query: `restaurantId`) |
| POST | `/api/tables` | Create new table |
| GET | `/api/tables/[id]` | Get single table |
| DELETE | `/api/tables/[id]` | Soft delete table |

---

### Dashboard APIs

#### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics (query: `range`: today/week/month) |

#### Staff Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/staff` | Get all staff members |
| POST | `/api/dashboard/staff` | Create new staff member |
| PATCH | `/api/dashboard/staff/[id]` | Update staff member |
| DELETE | `/api/dashboard/staff/[id]` | Delete staff member |

#### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/settings` | Get restaurant settings |
| PATCH | `/api/dashboard/settings` | Update settings (type: general/branding/billing) |

#### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/invoices` | Get invoices (query: `range`: today/week/month/all) |
| POST | `/api/dashboard/invoices` | Create invoice from order |

#### Kitchen
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kitchen/orders` | Get kitchen orders with stats |

---

### Public Restaurant APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/[slug]` | Get restaurant by slug |
| GET | `/api/restaurants/[slug]/menu` | Get restaurant menu with categories |

---

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image file (logo, menu items) |

---

### Platform Admin APIs

#### Platform Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/platform/auth/login` | Platform admin login |
| POST | `/api/platform/auth/logout` | Platform admin logout |
| GET | `/api/platform/auth/verify` | Verify platform admin session |

#### Platform Setup
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/platform/setup` | Create initial super admin |

#### Platform Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/platform/stats` | Get platform-wide statistics |

#### Admin Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/platform/admins` | Get all platform admins |
| POST | `/api/platform/admins` | Create new platform admin |
| PATCH | `/api/platform/admins/[id]` | Update platform admin |
| DELETE | `/api/platform/admins/[id]` | Delete platform admin |

#### Restaurant Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/platform/restaurants` | Get all restaurants (query: `status`: all/active/pending/inactive) |
| GET | `/api/platform/restaurants/[id]` | Get restaurant details |
| PATCH | `/api/platform/restaurants/[id]` | Update restaurant (activate/verify) |
| DELETE | `/api/platform/restaurants/[id]` | Delete restaurant |

---

## Frontend Pages

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/r/[slug]` | Restaurant home page |
| `/r/[slug]/menu` | Restaurant menu |
| `/r/[slug]/cart` | Shopping cart |
| `/r/[slug]/checkout` | Checkout page |
| `/r/[slug]/order/[id]` | Order tracking |
| `/r/[slug]/scan` | QR code scanner |

### Restaurant Dashboard
| Route | Description |
|-------|-------------|
| `/dashboard` | Dashboard home |
| `/dashboard/login` | Staff login |
| `/dashboard/menu` | Menu management |
| `/dashboard/orders` | Order management |
| `/dashboard/kitchen` | Kitchen display |
| `/dashboard/qr-codes` | QR code generator |
| `/dashboard/staff` | Staff management |
| `/dashboard/settings` | Restaurant settings |
| `/dashboard/invoices` | Invoice management |
| `/dashboard/analytics` | Analytics dashboard |

### Onboarding
| Route | Description |
|-------|-------------|
| `/onboarding` | Registration form |
| `/onboarding/verify` | Email verification |
| `/onboarding/setup` | Restaurant setup |

### Platform Admin
| Route | Description |
|-------|-------------|
| `/platform` | Platform dashboard |
| `/platform/login` | Platform admin login |
| `/platform/restaurants` | Restaurant management |
| `/platform/admins` | Admin management |

---

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```env
DATABASE_URL="postgresql://..."
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Seed the database (optional):
```bash
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

---

## License

MIT

