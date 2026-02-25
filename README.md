# CampusFind

A full-stack campus lost-and-found web application that lets students report, browse, and claim lost or found items.

## Team Members

| Name  
| ----------------------
| **Hein Oke Soe**  
| **Thant Si Thu Naing**
| **Thant Zin Min**

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS, Recharts, Axios, Lucide React |
| **Backend** | Next.js 16 (API Routes only), Mongoose |
| **Database** | MongoDB 6 |
| **Proxy** | Nginx (routes traffic, serves uploads) |
| **Auth** | JWT (7-day expiry) + bcryptjs |
| **Deployment** | Docker Compose |

---

## Features

- **Authentication** – Register and log in; all auth endpoints are in-memory rate-limited.
- **Item Reporting** – Report a lost or found item with a title, description, category, location, date, and an optional image (JPEG, PNG, GIF, WebP, up to 50 MB).
- **Browse & Search** – Browse all items with filtering by status (`lost` / `found` / `recovered`), category, keyword search, and pagination.
- **Claim System** – Any user can submit a claim with a message on an item they did not post. The item owner can accept or reject claims. Accepting a claim automatically marks the item as `recovered` and rejects all other pending claims.
- **Dashboard** – View your posted items and all incoming/outgoing claim requests in one place, with a notification badge for pending incoming claims.
- **Statistics** – Aggregated charts showing top item categories, most common locations, and a status overview (lost / found / recovered counts).
- **Account Settings** – Update display name, email, password, or delete your account (cascades to all owned items and claims).

---

## Screenshots

### Home
![Home page](docs/screenshots/home.png)

### Browse Items
![Browse & search items](docs/screenshots/items.png)

### Item Details
![Item detail view with claim button](docs/screenshots/item_detail.png)

### Report Item
![Report a lost item](docs/screenshots/lost.png)
![Report a found item](docs/screenshots/found.png)

### Dashboard
![User dashboard with claim notifications](docs/screenshots/dashboard.png)

### Statistics
![Statistics charts](docs/screenshots/statistics.png)

### Sign In & Sign Up
![Sign In](docs/screenshots/sign_in.png)
![Sign Up](docs/screenshots/sign_up.png)

### Account Settings
![Account settings page](docs/screenshots/settings.png)

---

## Project Structure

```
wad-project-2/
├── docker-compose.yml       # Orchestrates all four services
├── nginx.conf               # Reverse proxy configuration
├── backend/                 # Next.js app (API routes only)
│   └── src/
│       ├── app/api/
│       │   ├── auth/login/      POST  – log in
│       │   ├── auth/register/   POST  – create account
│       │   ├── items/           GET / POST
│       │   ├── items/[id]/      GET / PUT / DELETE
│       │   ├── claims/          GET / POST
│       │   ├── claims/[id]/     PUT / DELETE
│       │   ├── statistics/      GET
│       │   └── users/[id]/      GET / PUT / DELETE
│       ├── lib/
│       │   ├── auth.js          JWT sign / verify helpers
│       │   ├── mongodb.js       Mongoose connection
│       │   └── rateLimit.js     In-memory rate limiter
│       └── models/
│           ├── User.js
│           ├── Item.js
│           └── ClaimRequest.js
└── frontend/                # React + Vite SPA
    └── src/
        ├── api.js           # Axios instance (auto-attaches Bearer token)
        ├── App.jsx          # Router, navbar, auth state
        └── pages/
            ├── Home.jsx
            ├── Items.jsx
            ├── ItemDetails.jsx
            ├── ReportItem.jsx
            ├── EditItem.jsx
            ├── Dashboard.jsx
            ├── Statistics.jsx
            ├── Settings.jsx
            ├── Login.jsx
            └── Register.jsx
```

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | max 60 chars |
| `email` | String | unique |
| `passwordHash` | String | bcrypt |
| `createdAt` | Date | |

### Item
| Field | Type | Notes |
|---|---|---|
| `title` | String | max 100 chars |
| `description` | String | |
| `category` | String | |
| `location` | String | |
| `date` | Date | date of loss/find |
| `imageUrl` | String | `/uploads/<filename>` |
| `status` | String | `lost` \| `found` \| `recovered` |
| `userId` | ObjectId | ref User |
| `createdAt` | Date | |

### ClaimRequest
| Field | Type | Notes |
|---|---|---|
| `itemId` | ObjectId | ref Item |
| `requesterId` | ObjectId | ref User |
| `message` | String | max 500 chars |
| `status` | String | `pending` \| `accepted` \| `rejected` |
| `createdAt` | Date | |

---

## API Reference

All endpoints are prefixed with `/api`.  
Endpoints marked **🔒** require `Authorization: Bearer <token>`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create account. Rate limit: 5 req/min. |
| `POST` | `/auth/login` | — | Log in. Rate limit: 10 req/min. |

### Items
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/items` | — | List items. Query params: `search`, `status`, `category`, `userId`, `page`, `limit` (default 20, max 100). |
| `POST` | `/items` | 🔒 | Create item. Accepts `multipart/form-data` (with `image` file) or JSON. |
| `GET` | `/items/:id` | — | Get a single item (populates owner name & email). |
| `PUT` | `/items/:id` | 🔒 | Update item (owner only). Accepts `multipart/form-data` or JSON. |
| `DELETE` | `/items/:id` | 🔒 | Delete item and its claims (owner only). |

### Claims
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/claims` | 🔒 | Returns `{ submittedClaims, receivedClaims }` for the authenticated user. |
| `POST` | `/claims` | 🔒 | Submit a claim. Body: `{ itemId, message }`. Cannot claim own item or duplicate-claim. |
| `PUT` | `/claims/:id` | 🔒 | Owner: set `status` to `accepted` or `rejected`. Requester: update `message` (pending only). Accepting auto-recovers the item and rejects other pending claims. |
| `DELETE` | `/claims/:id` | 🔒 | Cancel/delete a claim (requester only). |

### Statistics
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/statistics` | — | Returns top 5 categories, top 5 locations, and status overview counts. |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/users/:id` | 🔒 | Get user profile (password excluded). |
| `PUT` | `/users/:id` | 🔒 | Update name, email, or password (self only). |
| `DELETE` | `/users/:id` | 🔒 | Delete account + all owned items and claims (self only). |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Running with Docker Compose

```bash
# Clone the repository
git clone https://github.com/heinokesoe/wad-project-2
cd wad-project-2

# (Optional) Set a strong JWT secret before first run
# Edit docker-compose.yml → backend.environment.JWT_SECRET

# Build and start all services
docker compose up --build
```

The application will be available at **http://localhost**.

| Service | Internal Port | Exposed |
|---|---|---|
| Nginx proxy | 80 | **80** (main entry point) |
| Frontend (Vite/Nginx) | 80 | 5173 (direct access) |
| Backend (Next.js) | 3000 | 3000 (direct access) |
| MongoDB | 27017 | 27017 |

---

## Environment Variables

### Backend (docker-compose.yml)

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://admin:campusfind_secret@mongo:27017/lostandfound?authSource=admin` | MongoDB connection string |
| `JWT_SECRET` | `change_me_in_production` | **Change this in production** |
| `PORT` | `3000` | Next.js server port |

### MongoDB (docker-compose.yml)

| Variable | Default |
|---|---|
| `MONGO_INITDB_ROOT_USERNAME` | `admin` |
| `MONGO_INITDB_ROOT_PASSWORD` | `campusfind_secret` |

---

## Docker Volumes

| Volume | Used By | Purpose |
|---|---|---|
| `mongodb_data` | `mongo` | Persistent database storage |
| `uploads_data` | `backend`, `proxy` | Uploaded images served at `/uploads/` |

Uploaded files are cached by Nginx for 30 days (`Cache-Control: public, max-age=2592000`).

---

## Notes

- Image uploads support JPEG, PNG, GIF, and WebP. HEIC conversion is handled client-side via the `heic2any` library.
- The `JWT_SECRET` default value **must** be changed before any public or production deployment.
