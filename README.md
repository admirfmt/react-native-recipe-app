# Recipe App

A mobile recipe app built with **React Native (Expo)** and a **Node.js / Express** REST API backed by a **Neon (PostgreSQL)** cloud database. Users can register, log in, and manage their own recipes: create, view, edit, delete, search, filter, save favorites and share recipes through the native share sheet.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Database Setup (Neon)](#database-setup-neon)
6. [Database Setup (Local)](#database-setup-local)
7. [Backend Setup](#backend-setup)
8. [Mobile App Setup](#mobile-app-setup)
9. [Running the Project](#running-the-project)
10. [API Reference](#api-reference)
11. [App Flow and Navigation](#app-flow-and-navigation)
12. [Reusable Components](#reusable-components)
13. [Authentication and Security](#authentication-and-security)
14. [Local Storage](#local-storage)

---

## Features

- **Registration and login** with username and password.
- **Persistent login:** the token is stored securely and restored when the app starts.
- **Logout** that removes the token and user-specific local data.
- **My recipes:** a logged-in user only sees the recipes they created.
- **Recipe details** with title, category and ingredients.
- **Create, edit and delete** recipes (REST `POST`, `PATCH`, `DELETE`) with a confirmation dialog before deletion.
- **Search by title** (debounced) and **filter by category**.
- **Favorites** stored locally on the device.
- **Share** a recipe with the native share sheet.
- **Loading indicators, error messages with retry, and friendly empty states.**
- **Responsive layout** for different screen sizes and orientations.
- Works on **Android and iOS** from one JavaScript code base.

Only plain user accounts exist. There are no admin, moderator or multi-role features.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native with Expo (JavaScript only) |
| Navigation | React Navigation (native stack) |
| State | React Context API (auth, favorites) |
| Secure storage | `expo-secure-store` (auth token) |
| Local storage | `@react-native-async-storage/async-storage` (favorites) |
| Backend | Node.js, Express |
| Database | PostgreSQL hosted on Neon, accessed with `pg` and runing locally |
| Auth | JWT (`jsonwebtoken`), password hashing with `bcryptjs` |
| Config | `dotenv` |

---

## Project Structure

The project consists of two separate folders: the Expo app and the Express API.

```
react-native-recipe-app/        # Mobile app (Expo)
├── App.js                      # Providers + navigator (auth-dependent screens)
├── config.js                   # API_URL, recipe categories
├── README.md
├── api/
│   ├── client.js               # Shared fetch wrapper (token, errors, 401 handling)
│   ├── auth.js                 # register, login, me
│   └── recipes.js              # get, create, update, delete recipes
├── context/
│   ├── AuthContext.js          # token, user, signIn, signUp, signOut
│   └── FavoritesContext.js     # favorite recipe ids (AsyncStorage)
├── components/
│   ├── ChipCategory.js
│   ├── CustomButton.js
│   ├── EmptyCard.js
│   ├── LoadingIndicator.js
│   └── RecipeCard.js
├── constants/
│   ├── colors.js
│   ├── spacing.js
│   └── typography.js
├── screens/
│   ├── HomeScreen.js
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── RecipesScreen.js        # list + search + category filter
│   ├── RecipeDetailScreen.js   # details, favorite, share, edit, delete
│   ├── RecipeFormScreen.js     # create and edit
│   └── FavoritesScreen.js
└── server/                     # Backend (Express + Neon)
│   ├── server.js               # Routes and middleware
│   └── db.js                   # pg connection pool
└── utils/
    └── shareText.js            # Builds the shared text
```

---

## Prerequisites

- **Node.js** 18 or newer and **npm**
- **Expo Go** on a phone (Android or iOS), or an Android emulator / iOS simulator
- A free **Neon** account: https://neon.com
- **Docker** and **PostgreSQL** to run database locally
- A computer and phone on the **same Wi-Fi network** if testing on a real device

---

## Database Setup (Neon)

1. Create a project in the [Neon Console](https://console.neon.tech).
2. Click **Connect** and copy the **connection string** (pooled is fine). It looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```
3. Open **SQL Editor** in the Neon Console, paste the contents (or create `.sql` file) and run it:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  category TEXT NOT NULL DEFAULT 'Annat',
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

4. Verify the tables exist under **Tables**, or run `SELECT * FROM users;`.

Make sure you run the SQL in the same branch and database that your connection string points to.

---

## Database Setup (Local)

You can run PostgreSQL on your own computer instead of Neon. This is useful for offline development and for testing without touching the cloud database. The backend code is the same in both cases; only `DATABASE_URL` changes.

**Docker is recommended** because it needs no manual installation and is easy to reset.

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine) installed and running.

1. Start a PostgreSQL container:

```bash
docker run -d \
  --name receptapp-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=receptapp \
  -p 5432:5432 \
  -v receptapp-pgdata:/var/lib/postgresql \
  postgres:18
```

What the options do:

| Option | Purpose |
|---|---|
| `--name receptapp-db` | Gives the container a fixed name |
| `POSTGRES_PASSWORD` | Superuser password (required) |
| `POSTGRES_DB` | Creates the `receptapp` database on first start |
| `-p 5432:5432` | Exposes PostgreSQL on `localhost:5432` |
| `-v receptapp-pgdata:...` | Keeps your data in a Docker volume so it survives restarts |

If you use an older image (PostgreSQL 17 or lower), mount the volume at `/var/lib/postgresql/data` instead.

On Windows PowerShell, put the command on one line or replace each trailing `\` with a backtick (`` ` ``).

2. Create the tables by running same SQL instructions in previous step (for Neon) inside the container or create ```.sql``` file for automatization:

```bash
docker exec -i receptapp-db psql -U postgres -d receptapp < your_file.sql
```

On Windows PowerShell use:

```powershell
Get-Content your_file.sql | docker exec -i receptapp-db psql -U postgres -d receptapp
```

3. Verify the tables:

```bash
docker exec -it receptapp-db psql -U postgres -d receptapp -c "\dt"
```

You should see `users` and `recipes`.

---

## Backend Setup

```bash
cd server
npm install
```

Required packages: `express`, `cors`, `jsonwebtoken`, `bcryptjs`, `pg`, `dotenv`.

```bash
npm install express cors jsonwebtoken bcryptjs pg dotenv
```

### Environment variables

Create a file named exactly `.env` in the `server` folder where you start the server:

```
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=replace-with-a-long-random-string
PORT=3000
```

### Start the server

```bash
node server.js
```

The server stops at startup if `JWT_SECRET` or `DATABASE_URL` is missing.

---

## Mobile App Setup

```bash
cd react-native-recipe-app
npm install
```

Install the Expo-compatible dependencies if they are missing:

```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-secure-store @react-native-async-storage/async-storage
```

### Configure the API address

Edit `config.js`:

```js
export const API_URL = "http://10.0.2.2:3000";
```

Choose the address that matches where the app runs:

| Where the app runs | `API_URL` |
|---|---|
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |
| Real phone (Expo Go) | `http://YOUR_COMPUTER_LOCAL_IP:3000` (for example `http://192.168.0.10:3000`) |
| Deployed backend | `https://your-server.example.com` |

`localhost` does not work on a real phone because it points to the phone itself. Find your computer's IP with `ipconfig` (Windows) or `ifconfig` / `ipconfig getifaddr en0` (macOS).

---

## Running the Project

Use two terminals.

**Terminal 1: backend**

```bash
cd server
node server.js
```

**Terminal 2: mobile app**

```bash
cd react-native-recipe-app
npx expo start
```

Then:
- Press `a` to open the Android emulator, or `i` for the iOS simulator (macOS only).
- Or scan the QR code with **Expo Go** on your phone.
- After changing `config.js` or navigation, restart with `npx expo start -c` to clear the cache.

### Quick API test (optional)

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"anna","password":"secret123"}'

# Log in (copy the token from the response)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"anna","password":"secret123"}'

# Get your recipes
curl http://localhost:3000/api/recipes -H "Authorization: Bearer YOUR_TOKEN"
```

---

## API Reference

Base URL: `http://localhost:3000`. All bodies and responses use JSON. Protected routes require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account. Body: `{ username, password }` (password at least 8 characters). Returns 201, or 409 if the username exists. |
| POST | `/api/auth/login` | No | Log in. Body: `{ username, password }`. Returns `{ token }`, or 401 for wrong credentials. |
| GET | `/api/auth/me` | Yes | Returns `{ id, username }` for the logged-in user. |
| GET | `/api/recipes` | Yes | Lists **only the user's own** recipes. Query: `search` (title, case-insensitive) and `category`. |
| GET | `/api/recipes/:id` | Yes | Returns one of the user's recipes, or 404. |
| POST | `/api/recipes` | Yes | Creates a recipe. Body: `{ title, ingredients: [], category }`. |
| PATCH | `/api/recipes/:id` | Yes | Updates title, ingredients and/or category. 403 if not the owner, 404 if missing. |
| DELETE | `/api/recipes/:id` | Yes | Deletes a recipe. Returns 204, 403 or 404. |

### Recipe object

```json
{
  "id": 1,
  "title": "Pancakes",
  "ingredients": ["3 dl flour", "6 dl milk", "3 eggs"],
  "category": "Frukost"
}
```

### Status codes

| Code | Meaning |
|---|---|
| 400 | Validation error (missing title, empty ingredients, short password) |
| 401 | Missing, invalid or expired token, or wrong login |
| 403 | Trying to change another user's recipe |
| 404 | Recipe not found |
| 409 | Username already exists |
| 500 | Unexpected server error (details are logged on the server only) |

Categories used by the app: `Breakfast`, `Lunch`, `Dinner`, `Dessert`, `Other`.

---

## App Flow and Navigation

Navigation uses **React Navigation** with a native stack. The visible screens depend on whether the user is logged in. When `isSignedIn` changes, the navigator switches automatically.

### Logged out

| Screen | Purpose |
|---|---|
| Home | App name, description, Login and Register buttons |
| Login | Username and password form |
| Register | Create an account |

### Logged in

| Screen | Purpose |
|---|---|
| Recipes (first screen) | The user's own recipes, with search and category filter |
| Home | Shows the logged-in username and a Logout button |
| RecipeDetail | Details, favorite, share, edit, delete |
| RecipeForm | Create or edit a recipe |
| Favorites | Saved recipes |

### Flows

- **Register:** the account is created, a confirmation is shown, and the user is sent to **Login**.
- **Login:** after success the user lands on the **Recipes** screen.
- **Logout:** the token is removed from SecureStore, and the user returns to **Home** (logged-out view).
- **App start:** the token is read from SecureStore, a loading view is shown while the app checks it, and `/api/auth/me` verifies the token and fetches the username.
- **Expired token:** if the API answers 401 for a request that had a token, the user is logged out automatically.

---

## Authentication and Security

- Passwords are hashed with **bcrypt** before they are stored. They are never returned by the API and never stored on the device.
- Login returns a **JWT** that expires after 7 days.
- The token is stored with **expo-secure-store** and sent in the `Authorization` header by a shared API client.
- The server protects its routes with middleware. Hiding buttons in the app is only a convenience; the server enforces access.
- **Ownership:** recipe queries filter on the logged-in user's id. `PATCH` and `DELETE` also verify ownership and return 403 otherwise.
- All SQL uses **parameterized queries** (`$1`, `$2`, ...) to prevent SQL injection.
- Login errors do not reveal whether the username or the password was wrong.
- Technical errors are logged with `console.error`. Users only see readable messages.

---

## Local Storage

| Data | Storage | Reason |
|---|---|---|
| Auth token | `expo-secure-store` | Sensitive, stored encrypted |
| Favorites (recipe ids) | `AsyncStorage` | Non-sensitive preference data |
| Passwords | Never stored | Security |

Favorites are cleared or scoped per user so that another account on the same device does not see them. Storage read errors never crash the app; defaults are used instead.

---

## License

This project is made for educational purposes.
