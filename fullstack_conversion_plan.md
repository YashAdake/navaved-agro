# 🚀 NAVAVED Agro — Fullstack Conversion Plan (v2 — Enhanced)

## Static → React (Vite) + FastAPI + PostgreSQL (Supabase)

> **Hosting Stack**: Vercel (Frontend) · Render (Backend) · Supabase (Database)
> 
> **v2 Enhancements**: Normalized relational schema, pagination/search, standardized API responses, dynamic admin forms, slug-based SEO URLs, Render cold-start handling

---

## 📋 Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Architecture Overview](#2-architecture-overview)
3. [Database Schema Design (Normalized)](#3-database-schema-design-normalized)
4. [Backend (FastAPI) Plan](#4-backend-fastapi-plan)
5. [Frontend (React + Vite) Plan](#5-frontend-react--vite-plan)
6. [Admin Dashboard Plan](#6-admin-dashboard-plan)
7. [Deployment Strategy](#7-deployment-strategy)
8. [Migration & Seeding Plan](#8-migration--seeding-plan)
9. [Project Folder Structure](#9-project-folder-structure)
10. [Implementation Phases](#10-implementation-phases)
11. [Decisions to Confirm](#11-decisions-to-confirm)

---

## 1. Current State Analysis

### What We Have
| File | Purpose | Size |
|------|---------|------|
| [index.html](file:///d:/Projects/navaved-agro/index.html) | Main landing page (hero, story, products, combos, quality, team, reviews, footer) | 1264 lines |
| [stores.html](file:///d:/Projects/navaved-agro/stores.html) | Store locator page with ~25 stores across 7 regions | 614 lines |
| [script.js](file:///d:/Projects/navaved-agro/script.js) | Product data, modals, combos, animations, scroll effects | 614 lines |
| [styles.css](file:///d:/Projects/navaved-agro/styles.css) | Complete styling with CSS variables, responsive design | ~73KB |
| `assets/` | Product images, team photos, logos | Multiple files |

### What Becomes Dynamic (from DB)
- **5 Products** — Aayurgul, Annapurna, Masala Mirchi, Guava Jam, Garlic Pickle
- **~25 Stores** — across Pune, Kolhapur, Sangli, Satara, Mumbai, Ahmednagar, Karnataka, Ratnagiri

### What Stays Static (No DB needed for V1)
- Hero section, Our Story, Quality/Certifications, Team section
- Combos (marketing content, uses fetched product data)
- Reviews (10 customer testimonials)
- Navigation, Footer, Animations, SEO tags, WhatsApp integration

---

## 2. Architecture Overview

```mermaid
graph TB
    subgraph "Frontend — Vercel (Free)"
        A[React + Vite App]
        A1[Public Pages<br/>Home · Products · Stores]
        A2[Admin Dashboard<br/>/dashboard-login]
    end

    subgraph "Backend — Render (Free)"
        B[FastAPI Server]
        B1[Public API<br/>GET products, stores<br/>+ Pagination + Search]
        B2[Auth API<br/>JWT Login]
        B3[Admin API<br/>CRUD with role guard]
        B4[Health Check<br/>/api/health]
    end

    subgraph "Database — Supabase (Free)"
        C[(PostgreSQL)]
        C1[users]
        C2[products + product_variants]
        C3[stores + store_addresses + store_contacts]
    end

    A1 --> B1
    A2 --> B2
    A2 --> B3
    B1 --> C
    B2 --> C1
    B3 --> C2
    B3 --> C3
    B4 -.-> C
```

### Request Flow
```
Public User → React → GET /api/products?page=1&limit=10 → FastAPI → DB (WHERE status='ACTIVE') → JSON Response
Admin User  → React → POST /api/auth/login → JWT → CRUD /api/admin/* (JWT in Authorization header)
```

### Standardized API Response Format
```json
// ✅ Success
{
  "success": true,
  "data": [],
  "message": "Products fetched successfully",
  "pagination": { "page": 1, "limit": 10, "total": 5, "total_pages": 1 }
}

// ❌ Error
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## 3. Database Schema Design (Normalized)

> [!IMPORTANT]
> **Key change from v1**: Replaced JSONB with proper relational tables for `price_range`, `address`, and `mobile`. JSONB kept **only** for `ingredients` and `benefits` (which are simple string arrays, not relational data).

### ER Diagram

```mermaid
erDiagram
    users {
        UUID user_id PK
        VARCHAR user_name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR mobile
        VARCHAR role
        VARCHAR status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    products {
        UUID product_id PK
        VARCHAR prod_name
        VARCHAR slug UK
        VARCHAR tagline
        VARCHAR badge
        TEXT description
        JSONB ingredients
        JSONB benefits
        VARCHAR image_url
        INTEGER sort_order
        VARCHAR status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    product_variants {
        UUID id PK
        UUID product_id FK
        INTEGER quantity
        VARCHAR unit
        NUMERIC price
        TIMESTAMPTZ created_at
    }

    stores {
        UUID store_id PK
        VARCHAR store_name
        VARCHAR slug UK
        VARCHAR owner_fname
        VARCHAR owner_lname
        VARCHAR region
        VARCHAR email
        VARCHAR tagline
        BOOLEAN has_whatsapp
        VARCHAR whatsapp_number
        INTEGER sort_order
        VARCHAR status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    store_addresses {
        UUID id PK
        UUID store_id FK
        TEXT address_line1
        TEXT address_line2
        VARCHAR city
        VARCHAR state
        VARCHAR pincode
        TIMESTAMPTZ created_at
    }

    store_contacts {
        UUID id PK
        UUID store_id FK
        VARCHAR mobile_number
    }

    products ||--o{ product_variants : "has many"
    stores ||--o{ store_addresses : "has many"
    stores ||--o{ store_contacts : "has many"
```

---

### Table: `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `user_id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Auto-generated |
| `user_name` | `VARCHAR(100)` | NOT NULL | Display name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login credential |
| `password_hash` | `VARCHAR(255)` | NOT NULL | bcrypt hashed |
| `mobile` | `VARCHAR(15)` | | Phone number |
| `role` | `VARCHAR(20)` | NOT NULL, DEFAULT `'ADMIN'` | Role-based access |
| `status` | `VARCHAR(10)` | NOT NULL, DEFAULT `'ACTIVE'`, CHECK IN (`'ACTIVE'`,`'INACTIVE'`) | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Auto-updated via trigger |

---

### Table: `products`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `product_id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | |
| `prod_name` | `VARCHAR(150)` | NOT NULL | e.g., "Aayurgul" |
| `slug` | `VARCHAR(255)` | NOT NULL, UNIQUE | e.g., "aayurgul" (SEO URL) |
| `tagline` | `VARCHAR(255)` | | e.g., "Ayurvedic Jaggery Powder" |
| `badge` | `VARCHAR(50)` | | e.g., "Bestseller", "Premium" |
| `description` | `TEXT` | | Full product description |
| `ingredients` | `JSONB` | | `["Pure Jaggery", "Ashvagandha", ...]` |
| `benefits` | `JSONB` | | `["Boosts immunity", ...]` |
| `image_url` | `VARCHAR(500)` | | Path/URL to product image |
| `sort_order` | `INTEGER` | DEFAULT `0` | Display ordering |
| `status` | `VARCHAR(10)` | NOT NULL, DEFAULT `'ACTIVE'`, CHECK | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | |

### Table: `product_variants`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| [id](file:///d:/Projects/navaved-agro/script.js#158-167) | `UUID` | PK, DEFAULT `gen_random_uuid()` | |
| `product_id` | `UUID` | FK → `products(product_id)` ON DELETE CASCADE | |
| `quantity` | `INTEGER` | NOT NULL | e.g., 215 |
| `unit` | `VARCHAR(20)` | NOT NULL | e.g., "g", "ml", "kg" |
| `price` | `NUMERIC(10,2)` | NOT NULL | e.g., 100.00 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | |

> **Example data for Aayurgul:**
> | quantity | unit | price |
> |----------|------|-------|
> | 215 | g | 100.00 |
> | 480 | g | 200.00 |

---

### Table: `stores`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `store_id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | |
| `store_name` | `VARCHAR(200)` | NOT NULL | |
| `slug` | `VARCHAR(255)` | NOT NULL, UNIQUE | e.g., "gau-bhoomi" |
| `owner_fname` | `VARCHAR(100)` | | |
| `owner_lname` | `VARCHAR(100)` | | |
| `region` | `VARCHAR(100)` | | e.g., "Pune", "Kolhapur" |
| `email` | `VARCHAR(255)` | | Optional |
| `tagline` | `VARCHAR(255)` | | Optional |
| `has_whatsapp` | `BOOLEAN` | DEFAULT `false` | |
| `whatsapp_number` | `VARCHAR(15)` | | |
| `sort_order` | `INTEGER` | DEFAULT `0` | |
| `status` | `VARCHAR(10)` | NOT NULL, DEFAULT `'ACTIVE'`, CHECK | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | |

### Table: `store_addresses`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| [id](file:///d:/Projects/navaved-agro/script.js#158-167) | `UUID` | PK, DEFAULT `gen_random_uuid()` | |
| `store_id` | `UUID` | FK → `stores(store_id)` ON DELETE CASCADE | |
| `address_line1` | `TEXT` | NOT NULL | Main address |
| `address_line2` | `TEXT` | | Secondary line |
| `city` | `VARCHAR(100)` | | |
| `state` | `VARCHAR(100)` | | |
| `pincode` | `VARCHAR(10)` | | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | |

### Table: `store_contacts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| [id](file:///d:/Projects/navaved-agro/script.js#158-167) | `UUID` | PK, DEFAULT `gen_random_uuid()` | |
| `store_id` | `UUID` | FK → `stores(store_id)` ON DELETE CASCADE | |
| `mobile_number` | `VARCHAR(15)` | NOT NULL | |

---

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sort ON products(sort_order);
CREATE INDEX idx_products_slug ON products(slug);

CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_region ON stores(region);
CREATE INDEX idx_stores_slug ON stores(slug);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_store_addresses_store ON store_addresses(store_id);
CREATE INDEX idx_store_contacts_store ON store_contacts(store_id);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

### Auto-Update Trigger

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 4. Backend (FastAPI) Plan

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, CORS, routers, exception handlers
│   ├── config.py               # Pydantic Settings (env vars)
│   ├── database.py             # SQLAlchemy async engine & session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py          # Product + ProductVariant models
│   │   └── store.py            # Store + StoreAddress + StoreContact models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py           # StandardResponse, PaginationMeta
│   │   ├── auth.py             # LoginRequest, LoginResponse, TokenData
│   │   ├── user.py
│   │   ├── product.py          # ProductCreate, ProductUpdate, ProductOut, VariantCreate
│   │   └── store.py            # StoreCreate, StoreUpdate, StoreOut, AddressCreate, ContactCreate
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py           # GET /api/health
│   │   ├── auth.py             # POST /api/auth/login, GET /api/auth/me
│   │   ├── products.py         # Public product endpoints
│   │   ├── stores.py           # Public store endpoints
│   │   └── admin.py            # All admin CRUD endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py     # JWT create/verify, password hash/verify
│   │   ├── product_service.py  # All product business logic + DB queries
│   │   └── store_service.py    # All store business logic + DB queries
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py             # get_current_user, require_admin dependencies
│       └── logging.py          # Request/response logging middleware
├── alembic/
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
├── seed_data.py
├── Dockerfile
└── .env.example
```

### Strict Layer Architecture

```
Router (HTTP handling only)
  ↓ calls
Service (Business logic, validation, DB queries)
  ↓ uses
Model (SQLAlchemy ORM)
  ↓ talks to
Database (PostgreSQL via asyncpg)
```

> [!IMPORTANT]
> **Rule**: Routers NEVER contain DB logic. All database operations go through the service layer.

---

### API Endpoints

#### Health Check
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | None | Health check (Render uptime pinger) |

#### Auth API
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | None | Login → returns JWT |
| `GET` | `/api/auth/me` | JWT | Get current user info |

#### Public Products API
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | None | List ACTIVE products (with variants) |
| `GET` | `/api/products/{slug}` | None | Single ACTIVE product by slug |

**Query parameters for `GET /api/products`:**
```
?search=jaggery              Search by name/tagline/description
&min_price=50                Filter by minimum variant price
&max_price=200               Filter by maximum variant price
&page=1                      Page number (default: 1)
&limit=10                    Items per page (default: 10)
```

#### Public Stores API
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/stores` | None | List ACTIVE stores (grouped by region) |
| `GET` | `/api/stores/{slug}` | None | Single ACTIVE store by slug |

**Query parameters for `GET /api/stores`:**
```
?region=Pune                 Filter by region
&search=goshala              Search by name/owner
&page=1                      Page number (default: 1)
&limit=20                    Items per page (default: 20)
```

#### Admin Products API (JWT + ADMIN role required)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/products` | JWT | List ALL products (ACTIVE + INACTIVE) |
| `POST` | `/api/admin/products` | JWT | Create product + variants |
| `PUT` | `/api/admin/products/{id}` | JWT | Update product + variants |
| `PATCH` | `/api/admin/products/{id}/status` | JWT | Toggle ACTIVE/INACTIVE |

#### Admin Stores API (JWT + ADMIN role required)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/stores` | JWT | List ALL stores (ACTIVE + INACTIVE) |
| `POST` | `/api/admin/stores` | JWT | Create store + addresses + contacts |
| `PUT` | `/api/admin/stores/{id}` | JWT | Update store + addresses + contacts |
| `PATCH` | `/api/admin/stores/{id}/status` | JWT | Toggle ACTIVE/INACTIVE |

---

### JWT Token Structure

```json
{
  "user_id": "uuid-here",
  "email": "admin@navavedagro.in",
  "role": "ADMIN",
  "exp": 1717200000
}
```

### Auth Dependencies

```python
# middleware/auth.py

async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    """Decode JWT, validate expiry, return user data"""
    ...

async def require_admin(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """Ensure current user has ADMIN role"""
    if current_user.role != "ADMIN":
        raise HTTPException(403, "Admin access required")
    return current_user
```

### Example Response Shapes

**GET /api/products (Public)**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "uuid",
      "prod_name": "Aayurgul",
      "slug": "aayurgul",
      "tagline": "Ayurvedic Jaggery Powder",
      "badge": "Bestseller",
      "description": "...",
      "ingredients": ["Pure Jaggery", "Ashvagandha", "..."],
      "benefits": ["Boosts immunity", "..."],
      "image_url": "/assets/products/aayurgul.jpeg",
      "variants": [
        {"id": "uuid", "quantity": 215, "unit": "g", "price": 100.00},
        {"id": "uuid", "quantity": 480, "unit": "g", "price": 200.00}
      ]
    }
  ],
  "message": "Products fetched successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  }
}
```

**GET /api/stores (Public — grouped by region)**
```json
{
  "success": true,
  "data": {
    "Pune": [
      {
        "store_id": "uuid",
        "store_name": "Gau Bhoomi (Shrinandini Goshala)",
        "slug": "gau-bhoomi",
        "owner_fname": "Nayana",
        "owner_lname": "Deshpande",
        "region": "Pune",
        "addresses": [
          {
            "address_line1": "Flat No. 1, Natraj Society",
            "address_line2": "Vitthal Mandir Road, Opposite Sanman Hotel",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411052"
          }
        ],
        "contacts": [
          {"mobile_number": "9420631474"},
          {"mobile_number": "8767241236"}
        ],
        "has_whatsapp": false
      }
    ],
    "Kolhapur": [...]
  },
  "message": "Stores fetched successfully"
}
```

### Request Logging Middleware

```python
# middleware/logging.py
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration:.2f}s)")
    return response
```

### Dependencies (`requirements.txt`)

```
fastapi
uvicorn[standard]
sqlalchemy[asyncio]
asyncpg
alembic
python-jose[cryptography]
passlib[bcrypt]
python-dotenv
pydantic-settings
python-multipart
```

---

## 5. Frontend (React + Vite) Plan

### Project Setup
- **Build Tool**: Vite with React template
- **Routing**: React Router v6
- **HTTP**: Centralized API client (fetch-based)
- **State**: React Context (auth) + custom hooks
- **Styling**: Migrate existing [styles.css](file:///d:/Projects/navaved-agro/styles.css) (already production-quality)
- **Icons**: Font Awesome (CDN)
- **Fonts**: Google Fonts (same as current)
- **SEO**: `react-helmet-async` for dynamic head tags

### Route Map

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | `HomePage` | Public | Full landing page |
| `/stores` | `StoresPage` | Public | Dynamic store locator |
| `/dashboard-login` | `LoginPage` | Public | Admin login |
| `/dashboard` | `DashboardLayout` | 🔒 Protected | Dashboard shell |
| `/dashboard/products` | `ProductsManager` | 🔒 Protected | Products CRUD |
| `/dashboard/stores` | `StoresManager` | 🔒 Protected | Stores CRUD |

### Component Breakdown

```
frontend/
├── public/
│   ├── assets/                     # Copied from current project
│   │   ├── logo/
│   │   ├── products/
│   │   ├── team/
│   │   └── hero-bg.png
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── main.jsx
│   ├── App.jsx                     # Router setup
│   ├── index.css                   # Migrated from styles.css
│   │
│   ├── api/
│   │   └── client.js               # Centralized API client
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Auth state + auto-logout on expiry
│   │
│   ├── hooks/
│   │   ├── useProducts.js           # Fetch & cache products
│   │   └── useStores.js             # Fetch & cache stores
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Preloader.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── ScrollProgress.jsx
│   │   │   ├── BackToTop.jsx
│   │   │   ├── WhatsAppFloat.jsx
│   │   │   ├── LoadingState.jsx     # "Waking up server..." spinner
│   │   │   ├── ErrorState.jsx       # Error display with retry
│   │   │   └── EmptyState.jsx       # "No items found" display
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── StorySection.jsx
│   │   │   ├── ProductsSection.jsx  # 🔄 Dynamic from API
│   │   │   ├── ProductModal.jsx     # 🔄 Dynamic
│   │   │   ├── CombosSection.jsx    # Semi-dynamic (uses fetched products)
│   │   │   ├── QualitySection.jsx
│   │   │   ├── HighlightsSection.jsx
│   │   │   ├── TeamSection.jsx
│   │   │   └── ReviewsSection.jsx
│   │   │
│   │   ├── stores/
│   │   │   ├── StoreCard.jsx        # 🔄 Dynamic
│   │   │   └── RegionGroup.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   └── dashboard/
│   │       ├── DashboardLayout.jsx
│   │       ├── Sidebar.jsx
│   │       ├── ProductsManager.jsx
│   │       ├── ProductForm.jsx      # Dynamic variant builder UI
│   │       ├── StoresManager.jsx
│   │       └── StoreForm.jsx        # Dynamic address/contact builder UI
│   │
│   └── pages/
│       ├── HomePage.jsx             # Assembles all home sections
│       ├── StoresPage.jsx           # Stores listing page
│       ├── LoginPage.jsx            # Login page
│       └── DashboardPage.jsx        # Dashboard page
│
├── index.html
├── vite.config.js
├── package.json
└── .env.example                     # VITE_API_URL=...
```

### Centralized API Client

```javascript
// src/api/client.js

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

const API = {
  // Public
  getProducts: (params) => request(`/api/products?${new URLSearchParams(params)}`),
  getProductBySlug: (slug) => request(`/api/products/${slug}`),
  getStores: (params) => request(`/api/stores?${new URLSearchParams(params)}`),

  // Auth
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getMe: () => request('/api/auth/me'),

  // Admin Products
  getAdminProducts: () => request('/api/admin/products'),
  createProduct: (data) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleProductStatus: (id) => request(`/api/admin/products/${id}/status`, { method: 'PATCH' }),

  // Admin Stores
  getAdminStores: () => request('/api/admin/stores'),
  createStore: (data) => request('/api/admin/stores', { method: 'POST', body: JSON.stringify(data) }),
  updateStore: (id, data) => request(`/api/admin/stores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleStoreStatus: (id) => request(`/api/admin/stores/${id}/status`, { method: 'PATCH' }),
};

export default API;
```

### Auth Context with Auto-Logout

```javascript
// src/context/AuthContext.jsx — key features:
// 1. Store JWT in localStorage
// 2. Decode token to get expiry
// 3. Set timeout to auto-logout when token expires
// 4. Provide: user, login(), logout(), isAuthenticated
```

### UX States (Critical for Render Cold Start)

Every data-fetching component will show:

| State | What's Shown |
|-------|-------------|
| **Loading** | Spinner + "Waking up server... please wait" (on first load after cold start) |
| **Error** | Error message + "Retry" button |
| **Empty** | "No products/stores found" with illustration |
| **Success** | Rendered data |

---

## 6. Admin Dashboard Plan

### Login Page (`/dashboard-login`)
- Clean, branded login form (NAVAVED colors)
- Fields: Email + Password
- Error messages for invalid credentials
- Redirect to `/dashboard/products` on success

### Dashboard Layout
- **Sidebar**: Products | Stores | Logout
- **Header**: Admin name, role badge, logout button
- **Main content**: Active section

### Products Manager (`/dashboard/products`)

| Feature | Details |
|---------|---------|
| **Table** | Image thumbnail, Name, Tagline, Variants (price list), Status pill, Actions |
| **Search** | Filter products by name |
| **Status Toggle** | ACTIVE ↔ INACTIVE switch (no hard delete) |
| **Add Product** | Modal with form |
| **Edit Product** | Same modal, pre-filled |

**Product Form Fields:**
- Name, Slug (auto-generated from name, editable)
- Tagline, Badge (dropdown: Bestseller/Premium/Spicy/Healthy/Homemade)
- Description (textarea)
- Ingredients (dynamic tag input — add/remove items)
- Benefits (dynamic tag input — add/remove items)
- **Variants (dynamic row builder):**
  - Each row: Quantity + Unit (dropdown: g/ml/kg/pcs) + Price
  - ➕ Add Variant / ❌ Remove Variant buttons
- Image URL
- Sort Order
- Status (Active/Inactive)

### Stores Manager (`/dashboard/stores`)

| Feature | Details |
|---------|---------|
| **Table** | Name, Owner, Region, Contacts, Status pill, Actions |
| **Filter** | Filter by region (dropdown) |
| **Search** | Search by name/owner |
| **Status Toggle** | ACTIVE ↔ INACTIVE switch |
| **Add Store** | Modal with form |
| **Edit Store** | Same modal, pre-filled |

**Store Form Fields:**
- Store Name, Slug (auto-generated, editable)
- Owner First Name, Last Name
- Region (dropdown: Pune/Kolhapur/Sangli & Satara/Mumbai/Ahmednagar/Karnataka/Ratnagiri/Other)
- Email, Tagline
- WhatsApp toggle + WhatsApp number (conditionally shown)
- **Addresses (dynamic row builder):**
  - Each row: Address Line 1 + Line 2 + City + State + Pincode
  - ➕ Add Address / ❌ Remove Address
- **Phone Numbers (dynamic row builder):**
  - Each row: Mobile Number
  - ➕ Add Contact / ❌ Remove Contact
- Sort Order
- Status (Active/Inactive)

> [!TIP]
> **No raw JSON input anywhere in the admin UI.** Every structured field has a proper form control with dynamic add/remove.

---

## 7. Deployment Strategy

### Frontend → Vercel (Free Tier)

```
1. GitHub repo connected to Vercel
2. Root directory: frontend/
3. Framework preset: Vite
4. Build command: npm run build
5. Output directory: dist
6. Environment variables:
   VITE_API_URL = https://navaved-api.onrender.com
```

### Backend → Render (Free Tier)

```
1. GitHub repo connected to Render
2. Root directory: backend/
3. Build command: pip install -r requirements.txt
4. Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
5. Environment variables:
   DATABASE_URL = postgresql+asyncpg://user:pass@host:port/db
   JWT_SECRET = <random-64-char-string>
   JWT_ALGORITHM = HS256
   JWT_EXPIRY_HOURS = 24
   CORS_ORIGINS = https://navavedagro.in,http://localhost:5173
```

### Database → Supabase (Free Tier)

```
1. Create Supabase project
2. Go to Settings → Database → Connection String
3. Use the "URI" format for DATABASE_URL
4. Run: alembic upgrade head (migrations)
5. Run: python seed_data.py (initial data)
```

### CORS Configuration (Strict)

```python
# Only allow known origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),  # From env var
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)
```

> [!WARNING]
> **Render Free Tier**: Instance sleeps after 15 min of inactivity. First request takes ~30-60s.
> - Frontend shows "Waking up server..." loading state
> - `/api/health` endpoint available for optional uptime pinger
> - Consider using [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 14 min (free)

---

## 8. Migration & Seeding Plan

### Alembic Migrations

```
Migration 001: Create users table
Migration 002: Create products + product_variants tables
Migration 003: Create stores + store_addresses + store_contacts tables
Migration 004: Add indexes
Migration 005: Add updated_at triggers
```

### Seed Data

**Admin User:**
```python
{
    "user_name": "Admin",
    "email": "admin@navavedagro.in",  # Confirm with user
    "password": "TempPass@2026",       # Confirm with user
    "role": "ADMIN",
    "status": "ACTIVE"
}
```

**5 Products** — from current [script.js](file:///d:/Projects/navaved-agro/script.js):
| Product | Variants |
|---------|----------|
| Aayurgul | 215g → ₹100, 480g → ₹200 |
| Annapurna | 50g → ₹35, 200g → ₹130 |
| Masala Mirchi | 50g → ₹60 |
| Guava Jam | 105g → ₹55 |
| Garlic Pickle | 100g → ₹75 |

**~25 Stores** — from current [stores.html](file:///d:/Projects/navaved-agro/stores.html):
| Region | Count |
|--------|-------|
| Pune | 8 stores |
| Kolhapur | 6 stores |
| Sangli & Satara | 3 stores |
| Mumbai | 1 store |
| Ahmednagar | 1 store |
| Karnataka | 2 stores |
| Ratnagiri | 1 store |

---

## 9. Project Folder Structure (Final)

```
navaved-agro/
│
├── frontend/                       # React + Vite → Vercel
│   ├── public/assets/              # All static images
│   ├── src/
│   │   ├── api/client.js           # Centralized API
│   │   ├── context/AuthContext.jsx  # Auth state
│   │   ├── hooks/                   # useProducts, useStores
│   │   ├── components/
│   │   │   ├── layout/             # Navbar, Footer, Preloader
│   │   │   ├── common/             # Loading, Error, Empty states
│   │   │   ├── home/               # All homepage sections
│   │   │   ├── stores/             # Store cards, region groups
│   │   │   ├── auth/               # Login, ProtectedRoute
│   │   │   └── dashboard/          # Admin UI components
│   │   ├── pages/                   # Page-level components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                        # FastAPI → Render
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic schemas + StandardResponse
│   │   ├── routers/                # HTTP handlers only
│   │   ├── services/               # Business logic + DB queries
│   │   └── middleware/             # Auth deps + logging
│   ├── alembic/
│   ├── seed_data.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── index.html                      # Original (kept for reference)
├── stores.html
├── script.js
├── styles.css
└── README.md
```

---

## 10. Implementation Phases

### Phase 1: Project Setup & Database 🏗️
> **Estimated**: ~2-3 hours

- [ ] Set up Supabase project, get connection string
- [ ] Initialize FastAPI project in `backend/`
- [ ] Create SQLAlchemy models (all 6 tables)
- [ ] Set up Alembic, create & run migrations
- [ ] Add indexes and triggers
- [ ] Write & run `seed_data.py` (all products, stores, admin user)
- [ ] Initialize Vite React project in `frontend/`

### Phase 2: Backend API Development 🔧
> **Estimated**: ~3-4 hours

- [ ] Config & database module (env vars, async sessions)
- [ ] Auth service (bcrypt, JWT create/verify)
- [ ] Auth middleware (get_current_user, require_admin)
- [ ] Request logging middleware
- [ ] Standard response schema (success/error format)
- [ ] Product service & router (public + admin CRUD with pagination/search)
- [ ] Store service & router (public + admin CRUD with pagination/search)
- [ ] Health check endpoint
- [ ] CORS configuration (strict mode)
- [ ] Test all endpoints

### Phase 3: Frontend — Public Pages 🎨
> **Estimated**: ~3-4 hours

- [ ] Copy [styles.css](file:///d:/Projects/navaved-agro/styles.css) → `index.css`, copy all assets
- [ ] Build layout components (Navbar, Footer, Preloader)
- [ ] Build common components (Loading, Error, Empty states)
- [ ] Build HomePage sections (Hero, Story, Quality, Highlights, Team, Reviews — static)
- [ ] Build ProductsSection (dynamic from API, with loading/error states)
- [ ] Build ProductModal (dynamic, with variants display)
- [ ] Build CombosSection (uses fetched product data + variants)
- [ ] Build StoresPage (dynamic from API, grouped by region)
- [ ] Centralized API client
- [ ] Custom hooks (useProducts, useStores)
- [ ] SEO meta tags (react-helmet-async)
- [ ] All scroll effects, animations, WhatsApp float, back-to-top

### Phase 4: Frontend — Admin Dashboard 🛡️
> **Estimated**: ~3-4 hours

- [ ] AuthContext with JWT storage + auto-logout on expiry
- [ ] ProtectedRoute component
- [ ] LoginPage with branded design
- [ ] DashboardLayout with sidebar
- [ ] ProductsManager (table view, search, status toggles)
- [ ] ProductForm (dynamic variant builder — add/remove rows)
- [ ] StoresManager (table view, region filter, search, status toggles)
- [ ] StoreForm (dynamic address/contact builder — add/remove rows)
- [ ] Dashboard CSS (separate stylesheet for admin)

### Phase 5: Deployment & Go-Live 🚀
> **Estimated**: ~1-2 hours

- [ ] Deploy backend to Render (with env vars)
- [ ] Deploy frontend to Vercel (with env vars)
- [ ] Configure custom domain (navavedagro.in) on Vercel
- [ ] Run seed data against production Supabase
- [ ] Test public pages (products, stores loading from API)
- [ ] Test admin login & CRUD in production
- [ ] Set up UptimeRobot to ping `/api/health` (optional)
- [ ] Final smoke test

---

## 11. Decisions to Confirm

> [!IMPORTANT]
> Please confirm these before we start building:

| # | Decision | Recommendation | Your Choice |
|---|----------|---------------|-------------|
| 1 | **Monorepo or separate repos?** | Single repo with `frontend/` + `backend/` folders | ? |
| 2 | **Admin credentials for seed** | Email: `admin@navavedagro.in`, temp password | ? |
| 3 | **Image handling** | V1: URL-based (admin provides URL). Future: Supabase Storage upload | ? |
| 4 | **Combos — dynamic or static?** | Static/semi-static for V1 | ? |
| 5 | **Reviews — dynamic or static?** | Static for V1 | ? |
| 6 | **Build order** | Phase 1 → 2 → 3 → 4 → 5 (sequential) | ? |

---

> [!TIP]
> **This plan preserves 100% of the existing website's design.** We're wrapping the same beautiful UI in React components, making Products & Stores dynamic from a normalized PostgreSQL database, and adding a full admin dashboard for content management. The slug-based URLs provide clean SEO-friendly routes.
