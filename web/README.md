# ZeroTrace Web Frontend

React + Vite + TypeScript web application for the ZeroTrace device wipe certification system.

## Features

- 🏠 **Home Page** - Project overview and quick access to verification
- ✅ **Certificate Verification** - Public verification of wipe certificates with VALID/INVALID badges
- 🔐 **Authentication** - Login and registration with JWT token management
- 📊 **User Dashboard** - View and manage your certificates
- 👑 **Admin Panel** - Administrative interface for viewing all certificates (admin-only)

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client with JWT interceptor
- **Tailwind CSS** - Utility-first styling

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:5000`

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the web directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Project Structure

```
web/
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.tsx
│   ├── context/            # React context providers
│   │   └── AuthContext.tsx
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── VerifyPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── AdminPage.tsx
│   ├── services/           # API services
│   │   └── api.ts
│   ├── App.tsx             # Root component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles (Tailwind)
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Routes

- `/` - Home page (public)
- `/verify` - Certificate verification (public)
- `/login` - Login/Register (public)
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin panel (admin-only)

## API Integration

The application connects to the backend API via the configured `VITE_API_BASE_URL`. All authenticated requests automatically include the JWT token from localStorage.

### API Service (`src/services/api.ts`)

- **Authentication**
  - `api.auth.register(email, password)` - Register new user
  - `api.auth.login(email, password)` - Login and get JWT

- **Certificates**
  - `api.certificates.create(data)` - Create new certificate
  - `api.certificates.verify(wipeId)` - Verify certificate (public)
  - `api.certificates.getUserCertificates()` - Get user's certificates
  - `api.certificates.getAllCertificates()` - Get all certificates (admin)

## Authentication

JWT tokens are stored in localStorage and automatically included in API requests via Axios interceptor. The AuthContext provides:

- `user` - Current user object
- `token` - JWT token
- `isAuthenticated` - Boolean auth status
- `isAdmin` - Boolean admin status
- `login(email, password)` - Login method
- `register(email, password)` - Register method
- `logout()` - Logout method

## Protected Routes

Routes can be protected using the `ProtectedRoute` component:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

## Development

```bash
# Start dev server (hot reload enabled)
npm run dev

# Server runs on http://localhost:3000
# API proxied from http://localhost:5000
```

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Output in dist/ directory
# Serve with any static file server
```

## Demo Credentials

- **Email**: admin@zerotrace.com
- **Password**: admin123

## License

MIT
