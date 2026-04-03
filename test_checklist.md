# 🧪 NAVAVED Agro — Manual Test Checklist

> Run the backend (`uvicorn app.main:app --reload --port 8000`) and frontend (`npm run dev`) before testing.

---

## 1. API Health & Basics

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 1.1 | API Root | Open `http://localhost:8000/` | JSON: `{success: true, message: "NAVAVED Agro API v1.0.0"}` | |
| 1.2 | API Docs | Open `http://localhost:8000/docs` | Swagger UI loads with all endpoints | |
| 1.3 | Health Check | Open `http://localhost:8000/api/health` | `{status: "healthy"}` | |
| 1.4 | CORS Headers | Check browser console on frontend for CORS errors | No CORS errors | |

---

## 2. Public Products API

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 2.1 | List all products | GET `http://localhost:8000/api/products?limit=50` | Returns 5 products with variants | |
| 2.2 | Pagination | GET `/api/products?page=1&limit=2` | Returns 2 products, pagination shows total=5 | |
| 2.3 | Search | GET `/api/products?search=aayurgul` | Returns only Aayurgul product | |
| 2.4 | Price filter | GET `/api/products?min_price=50&max_price=100` | Only products with variants in that range | |
| 2.5 | Get by slug | GET `/api/products/aayurgul` | Returns full Aayurgul product details | |
| 2.6 | Invalid slug | GET `/api/products/nonexistent` | 404: "Product not found" | |
| 2.7 | Variants present | Check any product in response | Has `variants` array with quantity, unit, price | |

---

## 3. Public Stores API

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 3.1 | List stores | GET `http://localhost:8000/api/stores` | Returns stores grouped by region (Kolhapur, Pune, etc.) | |
| 3.2 | Region filter | GET `/api/stores?region=Kolhapur` | Only Kolhapur region stores | |
| 3.3 | Search | GET `/api/stores?search=Awati` | Returns stores matching "Awati" | |
| 3.4 | Get by slug | GET `/api/stores/{any-store-slug}` | Returns store with addresses & contacts | |
| 3.5 | Addresses present | Check any store in response | Has `addresses` array with city, pincode etc. | |
| 3.6 | Contacts present | Check any store in response | Has `contacts` array with mobile_number | |

---

## 4. Authentication

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 4.1 | Login success | POST `/api/auth/login` with `{"email":"admin@gmail.com","password":"admin@123"}` | Returns access_token + user info | |
| 4.2 | Login wrong password | POST `/api/auth/login` with `{"email":"admin@gmail.com","password":"wrong"}` | 401: "Invalid email or password" | |
| 4.3 | Login wrong email | POST `/api/auth/login` with `{"email":"wrong@gmail.com","password":"admin@123"}` | 401: "Invalid email or password" | |
| 4.4 | Get /me with token | GET `/api/auth/me` with Bearer token from 4.1 | Returns user info for admin | |
| 4.5 | Get /me without token | GET `/api/auth/me` without auth header | 401: "Not authenticated" | |
| 4.6 | Admin endpoint no token | GET `/api/admin/products` without token | 401: Unauthorized | |

---

## 5. Admin Products CRUD

> First login and copy the `access_token` from test 4.1. Use it as `Authorization: Bearer <token>` header.

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 5.1 | List all (incl. inactive) | GET `/api/admin/products` with token | Returns all products (ACTIVE + INACTIVE) | |
| 5.2 | Create product | POST `/api/admin/products` with JSON body (see below) | New product created with slug | |
| 5.3 | Update product | PUT `/api/admin/products/{id}` with updated fields | Product updated | |
| 5.4 | Toggle status | PATCH `/api/admin/products/{id}/status` | Status toggles ACTIVE↔INACTIVE | |
| 5.5 | Inactive hidden publicly | After toggling to INACTIVE, GET `/api/products` | Product no longer in public list | |
| 5.6 | Toggle back | PATCH again | Status back to ACTIVE, product visible again | |

**Sample create body for test 5.2:**
```json
{
  "prod_name": "Test Product",
  "tagline": "Test tagline",
  "badge": "New",
  "description": "A test product description",
  "ingredients": ["ingredient1", "ingredient2"],
  "benefits": ["benefit1", "benefit2"],
  "image_url": "/assets/logo/logo.png",
  "sort_order": 99,
  "status": "ACTIVE",
  "variants": [
    {"quantity": 100, "unit": "g", "price": 50},
    {"quantity": 250, "unit": "g", "price": 120}
  ]
}
```

---

## 6. Admin Stores CRUD

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 6.1 | List all stores | GET `/api/admin/stores` with token | Returns all stores (ACTIVE + INACTIVE) | |
| 6.2 | Create store | POST `/api/admin/stores` with JSON body (see below) | New store created | |
| 6.3 | Update store | PUT `/api/admin/stores/{id}` with updated fields | Store updated | |
| 6.4 | Toggle status | PATCH `/api/admin/stores/{id}/status` | Status toggles ACTIVE↔INACTIVE | |
| 6.5 | Inactive hidden publicly | After toggling to INACTIVE, GET `/api/stores` | Store no longer in public list | |

**Sample create body for test 6.2:**
```json
{
  "store_name": "Test Store",
  "owner_fname": "John",
  "owner_lname": "Doe",
  "region": "Pune",
  "email": "test@store.com",
  "tagline": "Test store",
  "has_whatsapp": true,
  "whatsapp_number": "9876543210",
  "status": "ACTIVE",
  "addresses": [
    {"address_line1": "123 Test Street", "city": "Pune", "state": "Maharashtra", "pincode": "411001"}
  ],
  "contacts": [
    {"mobile_number": "9876543210"}
  ]
}
```

---

## 7. Frontend — Public Pages

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 7.1 | Homepage loads | Open `http://localhost:5173/` | All sections visible (hero, story, products, etc.) | |
| 7.2 | Preloader | Refresh the page | Brief loading animation then content appears | |
| 7.3 | Products from API | Scroll to products section | 5 products loaded with images and prices | |
| 7.4 | Product modal | Click "View Details" on any product | Modal opens with full details, ingredients, benefits | |
| 7.5 | WhatsApp link in modal | Check "Order on WhatsApp" button in modal | Opens WhatsApp with pre-filled message | |
| 7.6 | Combos section | Scroll to combos | 4 combo cards with pricing | |
| 7.7 | Stats counter | Scroll to highlights section | Numbers animate/count up | |
| 7.8 | Reviews marquee | Scroll to reviews | Reviews auto-scroll horizontally | |
| 7.9 | Navbar scroll | Scroll down | Navbar gets white background with blur | |
| 7.10 | Mobile nav | Resize to mobile width, click hamburger | Full-screen menu appears | |
| 7.11 | Scroll progress | Scroll down the page | Orange progress bar at top of page | |
| 7.12 | Back to top | Scroll down, click ↑ button | Scrolls to top smoothly | |
| 7.13 | WhatsApp float | Scroll down | Green WhatsApp button appears with tooltip | |
| 7.14 | Stores page | Click "Find Stores" button or go to `/stores` | Stores listed by region | |
| 7.15 | Store cards | Check any store card | Shows name, owner, address, phone, WhatsApp | |
| 7.16 | Back to home | Click back button on stores page | Returns to homepage | |

---

## 8. Frontend — Admin Dashboard

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 8.1 | Login page | Go to `http://localhost:5173/dashboard-login` | Dark glassmorphism login form | |
| 8.2 | Login success | Enter `admin@gmail.com` / `admin@123` | Redirects to `/dashboard/products` | |
| 8.3 | Protected redirect | Open `/dashboard/products` without login | Redirects to `/dashboard-login` | |
| 8.4 | Products table | After login, check products tab | Table shows all 5 products with image, name, variants, status | |
| 8.5 | Add product | Click "Add Product", fill form, save | New product appears in table | |
| 8.6 | Edit product | Click edit icon on any product | Form pre-filled with product data | |
| 8.7 | Add variant | In product form, click "Add Variant" | New variant row appears | |
| 8.8 | Add ingredient | Type ingredient name, press Enter or click "Add" | Tag appears in ingredients section | |
| 8.9 | Toggle status | Click status pill (ACTIVE/INACTIVE) | Status changes, row dims if inactive | |
| 8.10 | Stores tab | Click "Stores" in sidebar | Stores table loads with all stores | |
| 8.11 | Add store | Click "Add Store", fill form with address + contact | New store appears | |
| 8.12 | Add address | Click "Add Address" in store form | New address section appears | |
| 8.13 | Add contact | Click "Add Contact" | New phone number field appears | |
| 8.14 | Toggle store status | Click status pill on any store | Status toggles | |
| 8.15 | Sidebar navigation | Click between Products/Stores | Active link highlighted, content changes | |
| 8.16 | View site link | Click "View Site" in sidebar | Opens homepage in same tab | |
| 8.17 | Logout | Click "Logout" | Redirects to login page, token cleared | |
| 8.18 | Session persists | Login, close tab, reopen `/dashboard/products` | Still logged in (token in localStorage) | |

---

## 9. Backend Logging Verification

| # | Test | Steps | Expected Result | ✅/❌ |
|---|------|-------|-----------------|-------|
| 9.1 | Startup logs | Start backend server | Shows banner with DB URL, CORS, JWT expiry | |
| 9.2 | Request logging | Make any API call | Shows `→ GET /path [client=ip]` and `✓ GET /path → 200` | |
| 9.3 | Login logging | Login via API | Shows AUTH attempt, success/failure, JWT creation | |
| 9.4 | Product service logs | Fetch products | Shows "Fetching active products" with filters | |
| 9.5 | Admin CRUD logs | Create/update a product from dashboard | Shows `[ADMIN] Creating product...` and `[ADMIN] Product CREATED` | |
| 9.6 | Error logging | Try an invalid operation | Shows warning/error with details | |

---

## 🔑 Password Management Guide

### Important: Passwords CANNOT be Retrieved!

Passwords are stored as **bcrypt hashes** (one-way encryption). This means:
- ❌ You **CANNOT** see or retrieve a user's original password
- ❌ Not even from the database — it stores `$2b$12$randomSalt...hash`
- ✅ You **CAN** reset a password to a new one

### Using the manage_users.py Utility

```bash
cd d:\Projects\navaved-agro\backend
venv\Scripts\activate

# List all users
python manage_users.py list

# Add a new admin user
python manage_users.py add --email admin2@gmail.com --password mypass123 --name "Admin Two"

# Reset a forgotten password
python manage_users.py reset-password --email admin@gmail.com --password newSecurePass

# Deactivate a user (prevents login)
python manage_users.py set-status --email admin@gmail.com --status INACTIVE

# Reactivate a user
python manage_users.py set-status --email admin@gmail.com --status ACTIVE
```

### Current Admin Credentials
- **Email:** `admin@gmail.com`
- **Password:** `admin@123`
