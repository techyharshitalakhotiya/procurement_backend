# Procurement Backend

> Backend system for a procurement platform.

---

## System Architecture

```
Client / Postman
       │
       ▼
NestJS App (API Gateway)
JWT Auth · RBAC Guard · Validation · Rate Limiting · Pino Logging
       │
       ├── User Module        (Register, Login, Roles)
       ├── Auth Module        (JWT Strategy)
       ├── Roles Module       (Permissions per entity)
       ├── Item Module        (CRUD + Lock Logic)
       ├── Indent Module      (DRAFT → SUBMITTED → APPROVED/REJECTED)
       ├── MI Module          (DRAFT → ISSUED)
       ├── Vendor Module      (Auth + Quotes)
       └── RFQ Module         (DRAFT → SENT → CLOSED + Quotes)
                │
                ▼
          Prisma ORM
                │
                ▼
        PostgreSQL Database
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **TypeScript** | Primary language |
| **NestJS** | Backend framework |
| **PostgreSQL** | Relational database |
| **Prisma ORM** | Database access and migrations |
| **JWT** | Authentication (Users + Vendors) |
| **bcrypt** | Password hashing |
| **Swagger** | API documentation |
| **Pino** | Structured HTTP logging |
| **Docker** | Containerization |
| **class-validator** | DTO validation |
| **@nestjs/throttler** | Rate limiting |

---

## Features Implemented

### Core
- JWT Authentication for Users and Vendors (separate flows)
- Role-Based Access Control (RBAC) with per-entity permissions
- Admin User — bypasses all role/permission checks
- Normal User — access controlled via assigned roles
- User registration, login via email or phone
- Activate/Deactivate users
- Assign roles to users (at least one role required)

### Modules
- **Item** — CRUD with lock logic (non-editable once used in Indent/MI/RFQ), soft delete
- **Indent** — Full lifecycle: DRAFT → SUBMITTED → APPROVED/REJECTED
- **MI (Material Issue)** — DRAFT → ISSUED, optional link to approved Indent
- **Vendor** — Independent auth, quote submission on RFQ
- **RFQ** — DRAFT → SENT → CLOSED, vendor quote with quantity and per_unit_rate

### API Quality
- RESTful APIs for all modules
- DTO validation on all endpoints
- Global exception filter for consistent error responses
- Pagination on all listing APIs
- Filtering support (company_id, name, status)

### Bonus
- Docker + Docker Compose setup
- Pino structured logging (every request logged with method, URL, status, response time)
- Swagger API documentation
- Rate limiting (100 requests per minute per IP)
- Soft delete for Items

---

## Prerequisites

- Node.js v20+
- Docker Desktop
- npm

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/techyharshitalakhotiya/procurement_backend.git
cd procurement_backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://procurement:procurement123@localhost:5432/procurement_db"
JWT_SECRET="procurement_jwt_secret_key_2024"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 4. Start PostgreSQL with Docker

```bash
docker run --name procurement-postgres \
  -e POSTGRES_USER=procurement \
  -e POSTGRES_PASSWORD=procurement123 \
  -e POSTGRES_DB=procurement_db \
  -p 5432:5432 -d postgres:15
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Generate Prisma client

```bash
npx prisma generate
```

### 7. Start the application

```bash
npm run start:dev
```

### 8. Access Swagger documentation

```
http://localhost:3000/api/docs
```

---

## Running with Docker Compose

```bash
docker-compose up --build
```

This starts both the app and PostgreSQL together.

---

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Login with email/phone + password | No |

**Login Body:**
```json
{
  "identifier": "admin@test.com",
  "password": "admin123"
}
```

---

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register new user | No |
| GET | `/users` | Get all users | JWT |
| GET | `/users/:id` | Get user by ID | JWT |
| PATCH | `/users/:id/toggle-active` | Activate/Deactivate user | Admin only |
| POST | `/users/:id/assign-role/:roleId` | Assign role to user | Admin only |

---

### Roles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/roles` | Create role with permissions | Admin only |
| GET | `/roles` | Get all roles | JWT |
| GET | `/roles/:id` | Get role by ID | JWT |
| PATCH | `/roles/:id` | Update role | Admin only |
| DELETE | `/roles/:id` | Delete role | Admin only |

**Create Role Body:**
```json
{
  "name": "Manager",
  "description": "Can manage procurement",
  "permissions": {
    "item": { "create": true, "read": true, "update": true, "delete": true },
    "indent": { "create": true, "read": true, "update": true, "delete": false },
    "mi": { "create": true, "read": true, "update": true, "delete": false },
    "rfq": { "create": true, "read": true, "update": true, "delete": false },
    "vendor": { "create": false, "read": true, "update": false, "delete": false }
  }
}
```

---

### Items

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/items` | Create item | JWT + Permission |
| GET | `/items` | Get all items (paginated) | JWT + Permission |
| GET | `/items/:id` | Get item by ID | JWT + Permission |
| PATCH | `/items/:id` | Update item (locked if used) | JWT + Permission |
| DELETE | `/items/:id` | Soft delete item | JWT + Permission |

**Query Params for GET /items:**
- `company_id` — filter by company
- `name` — filter by name
- `page` — page number (default: 1)
- `limit` — items per page (default: 10)

---

### Indents

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/indents` | Create indent with items | JWT + Permission |
| GET | `/indents` | Get all indents (paginated) | JWT + Permission |
| GET | `/indents/:id` | Get indent by ID | JWT + Permission |
| PATCH | `/indents/:id` | Update indent (DRAFT only) | JWT + Permission |
| PATCH | `/indents/:id/submit` | Submit indent | JWT + Permission |
| PATCH | `/indents/:id/approve` | Approve indent | JWT + Permission |
| PATCH | `/indents/:id/reject` | Reject indent | JWT + Permission |

**Query Params for GET /indents:**
- `company_id` — filter by company
- `status` — filter by status (DRAFT/SUBMITTED/APPROVED/REJECTED)
- `page`, `limit`

---

### MI (Material Issue)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/mi` | Create MI | JWT + Permission |
| GET | `/mi` | Get all MIs (paginated) | JWT + Permission |
| GET | `/mi/:id` | Get MI by ID | JWT + Permission |
| PATCH | `/mi/:id/issue` | Issue material | JWT + Permission |

---

### Vendors

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/vendors/register` | Register vendor | No |
| POST | `/vendors/login` | Vendor login | No |
| GET | `/vendors` | Get all vendors (paginated) | JWT + Permission |
| GET | `/vendors/:id` | Get vendor by ID | JWT + Permission |
| PATCH | `/vendors/:id` | Update vendor | JWT + Permission |

---

### RFQ (Request for Quotation)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/rfq` | Create RFQ with items | JWT + Permission |
| GET | `/rfq` | Get all RFQs (paginated) | JWT + Permission |
| GET | `/rfq/:id` | Get RFQ by ID | JWT + Permission |
| PATCH | `/rfq/:id/attach-vendors` | Attach vendors to RFQ | JWT + Permission |
| PATCH | `/rfq/:id/send` | Send RFQ to vendors | JWT + Permission |
| PATCH | `/rfq/:id/close` | Close RFQ | JWT + Permission |
| POST | `/rfq/:id/quote` | Submit vendor quote | JWT + Permission |

---

## Project Structure

```
src/
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── permission.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── guards/
│       ├── admin.guard.ts
│       ├── jwt-auth.guard.ts
│       └── permissions.guard.ts
├── modules/
│   ├── auth/
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── user/
│   ├── roles/
│   ├── item/
│   ├── indent/
│   ├── mi/
│   ├── vendor/
│   └── rfq/
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── main.ts
```

---

## Database Schema

### Models
- **User** — id, name, email, phone, password, is_admin, is_active, timestamps
- **Role** — id, name, description, permissions (JSON), timestamps
- **UserRole** — junction table for user-role mapping
- **Item** — id, item_id, company_id, item_code, name, description, unit, price, created_by, timestamps, is_deleted
- **Indent** — id, indent_number, company_id, created_by, status, remarks, timestamps
- **IndentItem** — id, indent_id, item_id, quantity, remarks
- **MI** — id, mi_number, indent_id (optional), issued_by, status, timestamps
- **MIItem** — id, mi_id, item_id, quantity
- **Vendor** — id, name, email, phone, address, company_name, password, timestamps
- **RFQ** — id, rfq_number, company_id, created_by, status, timestamps
- **RFQItem** — id, rfq_id, item_id, quantity
- **RFQVendor** — id, rfq_id, vendor_id
- **Quote** — id, rfq_id, vendor_id, timestamps
- **QuoteItem** — id, quote_id, item_id, quantity, per_unit_rate

---

## Assumptions Made

1. Admin users are created directly in the database (no admin registration endpoint for security)
2. A user must have at least one role assigned before accessing protected resources
3. Items become locked (non-editable) once referenced in any Indent, MI, or RFQ
4. An Indent must be in APPROVED status before an MI can be linked to it
5. Vendors have a completely separate authentication flow from users
6. Only vendors attached to an RFQ can submit quotes on it
7. A vendor can only submit one quote per RFQ
8. RFQ must be in SENT status for vendors to submit quotes
9. company_id is treated as a string identifier (not linked to a Company model for simplicity)
10. JWT tokens expire in 7 days
11. Rate limiting is set to 100 requests per minute per IP

---

## Swagger Documentation

After starting the application, visit:
```
http://localhost:3000/api/docs
```

All endpoints are documented with request/response schemas and can be tested directly from the browser.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `PORT` | Application port | `3000` |