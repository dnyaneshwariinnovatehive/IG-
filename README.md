# InnovateGuide v2 — Premium Student Project Marketplace

InnovateGuide v2 is a full-stack web platform where students can browse, preview, and purchase ready-made academic projects. Admins manage the project catalogue, handle custom project requests, and review student-submitted projects — all backed by Google Sheets as the database and Google Drive as the file storage layer. There is no traditional SQL or NoSQL database; every record is a row in a Google Spreadsheet.

---

## Features

- **Project Marketplace** — Browse projects filtered by domain, difficulty, price range, and keyword search with paginated results
- **Trending, Featured, Top Selling, New** — Curated project lists on the landing page
- **Project Detail Pages** — Full description, screenshots, video preview, technology tags, and a purchase/download flow
- **Admin Dashboard** — Manage projects (create, edit, approve, reject, delete), view analytics, and handle custom requests
- **Custom Project Requests** — Students submit a form describing their requirements; admin reviews and responds via WhatsApp
- **JWT Authentication** — Secure admin login with short-lived tokens; no user registration needed
- **Google Sheets as Database** — All projects, requests, and settings are stored in a Google Spreadsheet via the Sheets API v4
- **Google Drive File Storage** — Project ZIP files and screenshots are uploaded to and served from Google Drive
- **Creator Privacy** — Creator name and email are never exposed in public API responses; only admins see them
- **Rate Limiting** — Express-level rate limiting (100 req/15 min general; 10 req/15 min on auth routes) plus Nginx-level rate limiting on auth endpoints
- **Security Headers** — Helmet.js + Nginx security headers (HSTS, X-Frame-Options, X-Content-Type-Options, XSS Protection)
- **Gzip Compression** — Response compression at both the Node.js and Nginx levels
- **Responsive UI** — Built with Tailwind CSS and Radix UI primitives; fully mobile-friendly
- **Smooth Animations** — Framer Motion page transitions and micro-interactions
- **Mock Data Fallback** — The server returns a set of mock projects when Google Sheets is unavailable, so the UI never breaks during setup

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3, clsx, tailwind-merge |
| **UI Components** | Radix UI (Dialog, Tabs, Select, Tooltip, Avatar, Dropdown, Accordion, Checkbox, Progress, Slider, Separator, Label) |
| **Animations** | Framer Motion 11 |
| **Routing** | React Router DOM 6 |
| **Data Fetching** | TanStack Query (React Query) v5 |
| **Forms** | React Hook Form 7 + Zod 3 validation |
| **HTTP Client** | Axios |
| **Charts** | Recharts 2 |
| **Icons** | Lucide React |
| **Toasts** | Sonner |
| **File Drop** | React Dropzone |
| **Backend Runtime** | Node.js 20+ |
| **Backend Framework** | Express.js 4 |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **File Uploads** | Multer |
| **Database** | Google Sheets API v4 (via googleapis SDK) |
| **File Storage** | Google Drive API v3 (via googleapis SDK) |
| **Security** | Helmet.js, express-rate-limit |
| **Process Manager** | PM2 (cluster mode) |
| **Reverse Proxy** | Nginx |
| **SSL** | Let's Encrypt via Certbot |

---

## Quick Start

### Prerequisites

- Node.js 20 or later
- npm 9 or later
- A Google Cloud project with Sheets and Drive APIs enabled (see [docs/GOOGLE_SHEETS_SETUP.md](docs/GOOGLE_SHEETS_SETUP.md))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd innovateguide-v2

# Install all dependencies (root + server + client)
npm run install:all
```

### Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Open .env and fill in your values
# At minimum, set the Google Sheets and Drive credentials
# See docs/DEPLOYMENT.md for a full variable reference
```

### Running the Development Server

```bash
# Start both the backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

The React dev server is available at [http://localhost:5173](http://localhost:5173).  
The Express API is available at [http://localhost:5000](http://localhost:5000).

To run only the backend:
```bash
npm run dev --prefix server
```

To run only the frontend:
```bash
npm run dev --prefix client
```

### Building for Production

```bash
# Build the React app into client/dist
npm run build

# Start the Express server (serves the built frontend via Nginx in production)
npm start
```

---

## Folder Structure

```
innovateguide-v2/
│
├── client/                          # React 19 frontend (Vite)
│   ├── index.html                   # HTML entry point
│   ├── vite.config.ts               # Vite configuration (dev proxy to :5000)
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── src/
│       ├── index.css                # Global styles and Tailwind directives
│       └── components/
│           ├── admin/               # Admin panel components
│           │   ├── AdminHeader.tsx  # Admin top navigation bar
│           │   └── AdminSidebar.tsx # Admin side navigation
│           └── ui/                  # Reusable Radix-based UI primitives
│               ├── button.tsx
│               ├── card.tsx
│               ├── dialog.tsx
│               ├── input.tsx
│               ├── select.tsx
│               ├── tabs.tsx
│               ├── badge.tsx
│               ├── avatar.tsx
│               ├── skeleton.tsx
│               ├── textarea.tsx
│               └── index.ts         # Barrel export
│
├── server/                          # Node.js / Express backend
│   ├── index.js                     # Server entry point (middleware, routes, startup)
│   ├── package.json                 # Backend dependencies
│   ├── config/
│   │   └── index.js                 # Centralised config (reads from .env)
│   ├── controllers/                 # Route handler logic
│   │   ├── authController.js        # Login, logout, getMe
│   │   ├── projectController.js     # CRUD + approve/reject + trending/featured lists
│   │   ├── categoryController.js    # Category management
│   │   ├── requestController.js     # Custom project request handling
│   │   └── adminController.js       # Admin-specific aggregate endpoints
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification (authenticateToken, requireAdmin, optionalAuth)
│   │   ├── upload.js                # Multer config for file uploads
│   │   └── errorHandler.js          # Global Express error handler
│   ├── routes/
│   │   ├── auth.js                  # POST /api/v1/auth/login, /logout, /me
│   │   ├── projects.js              # GET/POST/PUT/DELETE /api/v1/projects
│   │   ├── categories.js            # /api/v1/categories
│   │   ├── requests.js              # /api/v1/requests
│   │   ├── admin.js                 # /api/v1/admin (admin-only routes)
│   │   └── upload.js                # POST /api/v1/upload (file upload endpoints)
│   └── services/
│       ├── sheetsService.js         # Google Sheets CRUD (getRows, appendRow, updateRowById, deleteRowById)
│       ├── googleDrive.js           # Google Drive operations (uploadFile, deleteFile, makePublic)
│       └── googleSheets.js          # Low-level Sheets auth helper
│
├── nginx/
│   └── innovateguide.conf           # Production Nginx config (HTTPS, proxy, caching, rate limiting)
│
├── scripts/
│   ├── setup.sh                     # Fresh VPS setup (nvm, Node 20, PM2, Nginx, UFW)
│   └── deploy.sh                    # Deployment script (pull, install, build, restart)
│
├── docs/
│   ├── DEPLOYMENT.md                # Full deployment and operations guide
│   └── GOOGLE_SHEETS_SETUP.md      # Step-by-step Google Sheets and Drive setup
│
├── .env.example                     # Environment variable template
├── .gitignore
├── ecosystem.config.js              # PM2 cluster mode configuration
└── package.json                     # Root scripts (dev, build, start, install:all)
```

---

## Environment Variables

All configuration is done through environment variables. Copy `.env.example` to `.env` and fill in the values before starting the server.

See `.env.example` at the project root for the full list of variables with default values, and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#environment-setup) for a detailed explanation of every variable.

Key variables at a glance:

| Variable | Purpose |
|---|---|
| `PORT` | Express server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ID of the Google Sheets database |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email for API auth |
| `GOOGLE_PRIVATE_KEY` | Service account private key |
| `GOOGLE_DRIVE_FOLDER_ID` | Drive folder for project ZIP files |
| `GOOGLE_DRIVE_SCREENSHOTS_FOLDER_ID` | Drive folder for screenshots |
| `FRONTEND_URL` | Frontend origin (used in CORS policy) |

---

## Deployment

For full deployment instructions including Nginx setup, SSL, PM2, and monitoring, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Quick summary:

```bash
# On a fresh Hostinger VPS (Ubuntu 22.04+)
bash scripts/setup.sh

# After cloning the repo and filling in .env
bash scripts/deploy.sh
```

---

## Architecture

### Google Sheets as a Database

InnovateGuide v2 uses Google Sheets as its primary data store. This decision eliminates the need to provision and maintain a traditional database while keeping data easily accessible and editable through a familiar spreadsheet UI.

The data model is flat and tab-based:

- Each Google Sheets tab (e.g., `Projects`, `CustomRequests`) acts as a table.
- Row 1 of each tab contains column headers.
- Each subsequent row is a record.
- All values are stored as strings; the server normalises them to correct types on read (booleans from `"true"`/`"false"`, numbers via `parseInt`/`parseFloat`, arrays from CSV strings).

The `sheetsService.js` module provides four operations that cover all use cases:

| Function | Description |
|---|---|
| `getRows(sheetName)` | Reads all rows, returns array of objects keyed by headers |
| `appendRow(sheetName, rowData)` | Appends a new row, mapping object keys to header columns |
| `updateRowById(sheetName, id, data)` | Finds the row with the matching `id` column and updates specified fields |
| `deleteRowById(sheetName, id)` | Finds the row with the matching `id` column and deletes it |

If the Google Sheets service is unavailable or not configured, the Projects endpoint falls back to a set of in-memory mock projects so the frontend always renders something useful.

### Google Drive as File Storage

Project ZIP files and screenshot images are uploaded to Google Drive using the same service account credentials. The server stores only the Google Drive `fileId` in the spreadsheet, never the raw binary data. Download URLs are constructed at request time:

```
https://drive.google.com/uc?export=download&id=<fileId>
```

### Request Flow

```
Browser
  └── HTTPS request
        └── Nginx (TLS termination, static files, rate limiting)
              └── /api/* → proxy to Express (port 5000)
                    ├── Middleware (Helmet, CORS, rate limit, auth, body parse)
                    ├── Route → Controller
                    └── Controller → SheetsService / DriveService → Google APIs
```

---

## Creator Privacy

When a student or creator submits a project, their name (`creatorName`) and email (`creatorEmail`) are stored in the Projects sheet. However, these fields are deliberately stripped from all public API responses by the `publicProject()` function in `projectController.js`:

```js
const publicProject = (p) => {
  const { creatorName, creatorEmail, ...rest } = p;
  return rest;
};
```

Public-facing endpoints (`GET /api/v1/projects`, `GET /api/v1/projects/:id`) always pass data through this filter unless the request is authenticated as an admin. Admin-authenticated requests receive the full record including creator identity.

This ensures that student contact details are never exposed to other visitors of the marketplace.

---

## License

MIT License

Copyright (c) 2025 InnovateGuide

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
