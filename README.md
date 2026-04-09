# FinanceTracker

A production-quality personal finance tracking system with role-based access control, JWT authentication (access + refresh tokens), analytics dashboards, and full transaction management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI 0.111, SQLAlchemy 2, Alembic, SQLite |
| Auth | python-jose (JWT HS256), passlib/bcrypt, slowapi (rate limiting) |
| Validation | Pydantic v2 |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts 2, TanStack Query v5 |
| HTTP Client | Axios with silent auto-refresh interceptor + queue drain |
| Notifications | react-hot-toast |
| Tests | pytest, FastAPI TestClient (26 tests) |
| Container | Docker, docker-compose, nginx |

---

## Local Setup

```bash
# Backend
cd finance-system/backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd finance-system/frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| Health check | http://localhost:8000/health |

---

## Docker Setup

```bash
cd finance-system
docker-compose up --build
docker exec finance_backend python seed.py
```

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@fin.com | Test@1234 |
| Analyst | analyst@fin.com | Test@1234 |
| Viewer | viewer@fin.com | Test@1234 |

---

## Role Permissions

| Feature | Viewer | Analyst | Admin |
|---|---|---|---|
| View transactions & summary | Yes | Yes | Yes |
| Recent transactions (last 10) | Yes | Yes | Yes |
| Monthly income/expense (12 months) | No | Yes | Yes |
| Category breakdown & insights | No | Yes | Yes |
| CSV export | No | Yes | Yes |
| Create / edit / delete transactions | No | No | Yes |
| User management & audit logs | No | No | Yes |

---

## API Endpoints

### Auth — `/api/v1/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Register new user (name, email, password, role) |
| POST | `/login` | Login — returns access + refresh JWT |
| POST | `/refresh` | Exchange refresh token for new token pair |
| POST | `/logout` | Client-side token discard |

### Transactions — `/api/v1/transactions`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Any | List with filters: type, category, date_from, date_to, search, page, limit |
| POST | `/` | Admin | Create transaction |
| GET | `/{id}` | Any | Get single transaction |
| PUT | `/{id}` | Admin | Update transaction |
| DELETE | `/{id}` | Admin | Soft-delete transaction |
| GET | `/export/csv` | Analyst+ | Download all transactions as CSV |

### Analytics — `/api/v1/analytics`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/summary` | Any | Total income, expenses, net balance, count (filterable by date) |
| GET | `/recent` | Any | Last 10 transactions |
| GET | `/monthly` | Analyst+ | Monthly income/expense for last 12 months |
| GET | `/categories` | Analyst+ | Expense breakdown by category with percentages |
| GET | `/insights` | Analyst+ | Top category, highest expense month, avg daily spend, MoM change % |

### Users & Admin — `/api/v1`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users |
| GET | `/users/{id}` | Admin | Get user by ID |
| PATCH | `/users/{id}` | Admin | Update role or active status |
| DELETE | `/users/{id}` | Admin | Soft-deactivate user |
| GET | `/admin/audit-logs` | Admin | Paginated audit log (action, entity, timestamp) |

---

## Frontend Pages

| Page | Route | Access |
|---|---|---|
| Login | `/login` | Public — quick-pick demo role buttons |
| Register | `/register` | Public — 2-step: pick role → fill details |
| Dashboard | `/` | All roles — stat cards, charts (analyst+), recent transactions, insights banner |
| Transactions | `/transactions` | All roles — filters, search, pagination, add/edit/delete (admin), CSV export (analyst+) |
| Analytics | `/analytics` | Analyst+ — monthly bar, net balance line, category pie + breakdown table |

---

## Token Strategy

- Access token: 15-minute expiry, carries `sub`, `email`, `role`
- Refresh token: 7-day expiry
- Tokens stored in `localStorage`
- Axios interceptor silently refreshes on 401; queues concurrent requests during refresh; dispatches `auth:logout` event on refresh failure so `AuthContext` redirects without a hard reload
- Rate limit: 5 login attempts per minute per IP (disabled in test mode via `TESTING=1` env var)

---

## Data Model

**User** — id, name, email, hashed_password, role (viewer/analyst/admin), is_active, created_at

**Transaction** — id, user_id, amount (Decimal 10,2), type (income/expense), category, date, note, is_deleted, created_at, updated_at

**AuditLog** — id, user_id, action (created/updated/deleted), entity, entity_id, timestamp

Categories: Food, Rent, Salary, Transport, Entertainment, Healthcare, Shopping, Utilities

---

## Running Tests

```bash
cd finance-system/backend
pytest app/tests/ -v
# 26 tests — all pass
```

Tests use an in-memory SQLite test database (`test.db`) with `TESTING=1` to bypass rate limiting. Fixtures are session-scoped.

---

## Configuration

All settings are in `app/core/config.py` via `pydantic-settings` and can be overridden with a `.env` file:

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `super-secret-key-change-in-production` | JWT signing key |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `DATABASE_URL` | `sqlite:///./finance.db` | Swap to PostgreSQL by changing this only |

---

## Project Structure

```
finance-system/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/        # auth, transactions, analytics, users
│   │   ├── core/                 # config, security, deps, database
│   │   ├── models/               # User, Transaction, AuditLog
│   │   ├── schemas/              # Pydantic v2 — auth, transaction, analytics, user
│   │   ├── services/             # analytics_service, transaction_service, user_service
│   │   └── tests/                # conftest, test_auth, test_transactions, test_analytics
│   ├── alembic/                  # migrations (0001_initial_schema)
│   ├── seed.py                   # seeds 3 users + 60 random transactions
│   ├── main.py                   # FastAPI app, CORS, error handlers
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # Axios instance + silent refresh interceptor
│   │   ├── components/
│   │   │   ├── charts/           # MonthlyBar, CategoryPie, BalanceLine (Recharts)
│   │   │   ├── Navbar.jsx        # Sticky top bar, user menu, profile modal
│   │   │   ├── Sidebar.jsx       # Desktop sidebar + mobile bottom nav
│   │   │   ├── StatCard.jsx      # Metric card with loading skeleton
│   │   │   ├── ThemeToggle.jsx   # Dark/light mode toggle (persisted to localStorage)
│   │   │   └── TransactionTable.jsx
│   │   ├── context/AuthContext.jsx  # Token state, login/logout, hasRole helper
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useTransactions.js   # CRUD mutations with analytics cache invalidation
│   │   └── pages/                # Login, Register, Dashboard, Transactions, Analytics
│   ├── index.html
│   ├── vite.config.js            # Dev server port 3000, proxy /api → :8000
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

---

## Assumptions & Notes

- SQLite used for simplicity — swap to PostgreSQL by changing `DATABASE_URL` only
- Soft deletes throughout — no entity is ever hard-deleted
- Amounts stored as `Decimal(10,2)`, must be positive
- Currency displayed in Indian Rupees (₹) with `en-IN` locale formatting
- Tokens stored in `localStorage`
- No email verification on registration
- Profile Settings modal in Navbar is UI-only (not wired to a backend endpoint)
- Seed generates 60 transactions spread across the last 180 days for realistic chart data
