# Video App — Backend

REST API server for the Video App frontend, which displays movies, trending movies, and favourite movies. Built with Node.js and Express over HTTPS.

---

## Tech Stack

| Package            | Purpose                                 |
| ------------------ | --------------------------------------- |
| Express 5          | HTTP framework                          |
| jsonwebtoken       | JWT auth (HttpOnly cookie)              |
| bcryptjs           | Password hashing                        |
| helmet             | Security headers                        |
| express-rate-limit | Brute-force protection on `/login`      |
| cors               | Cross-origin requests from the frontend |
| cookie-parser      | Read auth cookie from requests          |
| dotenv             | Environment variable loading            |

---

## Prerequisites

- Node.js 18+
- SSL certificate files (`server.key`, `server.cert`) in the project root
- A `.env` file (see [Environment Variables](#environment-variables))

---

## Demo Credentials

This is a portfolio project. Use the following credentials to log in and explore the app:

| Field    | Value                |
| -------- | -------------------- |
| Username | `admin@videoapp.com` |
| Password | `admin123`           |

> These are intentionally public throwaway credentials for review purposes only.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the server
node index.js
```

The server listens on **https://localhost:3030** by default.

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3030
SECRET_KEY=<your-jwt-secret>
JWT_TOKEN_REFRESH_THRESHOLD=300
```

| Variable                      | Description                                     | Default |
| ----------------------------- | ----------------------------------------------- | ------- |
| `PORT`                        | Port the HTTPS server listens on                | `3030`  |
| `SECRET_KEY`                  | Secret used to sign and verify JWTs             | —       |
| `JWT_TOKEN_REFRESH_THRESHOLD` | Seconds before expiry to auto-refresh the token | `300`   |

---

## SSL Certificate

The server requires a self-signed certificate for local HTTPS. Generate one with:

```bash
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.cert -days 365 -nodes
```

Both files are gitignored and must be present before starting the server.

---

## API Reference

All protected routes require a valid `authToken` cookie (set automatically on login). The token expires after **7 days**; it is silently refreshed if fewer than `JWT_TOKEN_REFRESH_THRESHOLD` seconds remain.

### Public Routes

#### `POST /login`

Authenticate a user and set the auth cookie.

- Rate-limited to **10 requests per 15 minutes** per IP.

**Request body**

```json
{
  "userName": "admin@videoapp.com",
  "password": "yourpassword"
}
```

**Response `200`**

```json
{
  "message": "Login successful!",
  "userInfo": {
    "userID": "1001",
    "userName": "admin@videoapp.com",
    "userFullName": "Sandesh Sawant"
  }
}
```

**Response `400`** — invalid username or password  
**Response `429`** — too many login attempts

---

#### `POST /logout`

Clear the auth cookie and end the session.

**Response `200`**

```json
{ "isUserLogout": true }
```

---

### Protected Routes

All routes below require a valid `authToken` cookie. Returns `401` if missing, `403` if invalid.

#### `GET /authme`

Returns the authenticated user's info decoded from the token.

**Response `200`**

```json
{
  "userInfo": {
    "userID": "1001",
    "userName": "admin@videoapp.com",
    "userFullName": "Sandesh Sawant"
  }
}
```

---

#### `GET /getmovies`

Returns the full movie catalogue used by the frontend's main browse view.

**Response `200`** — array of movie container objects

---

#### `GET /gettrendingmovies`

Returns a curated list of trending movies (4 items).

**Response `200`** — array of movie container objects

---

#### `GET /getSearchMovie?searchString=<query>`

Search movies by title or genre.

| Query param    | Required | Description                                                              |
| -------------- | -------- | ------------------------------------------------------------------------ |
| `searchString` | Yes      | Space-separated keywords; matches any whole word against title or genres |

**Response `200`** — array of matching movie container objects  
**Response `400`** — `searchString` is empty

---

#### `POST /getsimilarmovies`

Returns movies that share at least one genre with the given movie, excluding the movie itself.

**Request body**

```json
{
  "contentId": "movie-id-here",
  "genres": ["Action", "Drama"]
}
```

**Response `200`** — array of similar movie container objects  
**Response `400`** — missing `contentId` or `genres`

---

## Project Structure

```
video-app-backend/
├── index.js                        # App entry point, route definitions
├── src/
│   ├── controllers/
│   │   └── authController.js       # Route handler logic
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification & token refresh
│   ├── models/
│   │   └── users.js                # In-memory user store
│   ├── services/
│   │   └── authService.js          # JWT generation helper
│   └── data/
│       └── moviesData.json         # Movie catalogue (static dataset)
├── public/                         # Static file serving
├── server.key                      # SSL private key (gitignored)
├── server.cert                     # SSL certificate (gitignored)
├── .env                            # Environment variables (gitignored)
└── package.json
```

---

## Current Limitations

> **Note:** The following data is currently hardcoded and will be migrated to a proper database in a future release.

- **Movie catalogue** — served from a static JSON file (`src/data/moviesData.json`). All browse, trending, search, and similar-movie responses draw from this file.
- **User accounts** — defined as an in-memory array in `src/models/users.js`. Only one user exists by default.

---

## Security Notes

- Auth tokens are stored in **HttpOnly, Secure, SameSite=None** cookies — not accessible to JavaScript.
- The CORS policy is locked to `https://localhost:3000` (the frontend origin). Requests from any other origin receive `403 Forbidden`.
- Login endpoint is rate-limited to prevent brute-force attacks.
- Passwords are stored as bcrypt hashes (cost factor 12).

---

## Frontend

The companion frontend application connects to this server and provides:

- Movie browse / catalogue view
- Trending movies section
- Favourite movies management
- Search functionality
