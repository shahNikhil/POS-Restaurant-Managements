# POS Restaurant Management

A menu-and-orders system for small restaurants/shops:

- **Public menu page** — anyone can browse the live menu (name, price, photo) and place an order.
- **Superadmin** — logs in to add/edit/delete menu items, upload photos, set prices and availability.
- **Staff** — logs in to view incoming orders and payment status, and move orders through their lifecycle (received → preparing → ready → completed).

Payment gateway integration (actually charging cards online) is intentionally **not** wired up yet — orders currently record `paymentMethod`/`paymentStatus` as placeholders, to be finished in a follow-up.

## Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth, Multer for local image uploads.
- **App**: React Native via Expo — runs on iOS, Android, and web from one codebase.

## Project layout

```
backend/   Express API + MongoDB models
mobile/    Expo app (iOS / Android / web)
```

## Backend setup

1. `cd backend && npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — get a free cluster at https://www.mongodb.com/cloud/atlas
   - `JWT_SECRET` — any long random string
   - `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` — credentials for the first admin account
3. Create the first superadmin account: `npm run seed`
4. Start the API: `npm run dev` (or `npm start`)

The API runs on `http://localhost:4000` by default. Uploaded menu photos are stored in `backend/uploads/` and served at `http://localhost:4000/uploads/<filename>`.

### API summary

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/login | none | Login for staff & superadmin |
| POST | /api/auth/staff | superadmin | Create a staff account |
| GET | /api/auth/me | any logged-in user | Current user info |
| GET | /api/menu | none | Public menu (available items only) |
| GET | /api/menu/all | superadmin | All menu items incl. hidden |
| POST | /api/menu | superadmin | Create menu item (multipart, field `image`) |
| PUT | /api/menu/:id | superadmin | Update menu item |
| DELETE | /api/menu/:id | superadmin | Delete menu item |
| POST | /api/orders | none | Place an order from the menu page |
| GET | /api/orders | staff/superadmin | List orders |
| PATCH | /api/orders/:id | staff/superadmin | Update order/payment status |

## Mobile/web app setup

1. `cd mobile && npm install`
2. In `src/api/client.js`, set `API_BASE_URL` to reach your backend:
   - Web (`npm run web`): `http://localhost:4000` works.
   - Physical phone or emulator: replace `localhost` with your computer's LAN IP (e.g. `http://192.168.1.20:4000`) since the device can't reach your machine's `localhost`.
3. Run it:
   - `npm run web` — opens in browser
   - `npm run ios` — requires Xcode / iOS simulator (Mac only)
   - `npm run android` — requires Android Studio / emulator
   - Or `npm start` and scan the QR code with the Expo Go app on your phone

## Creating staff accounts

There's no signup screen by design — only a superadmin can create staff logins. After logging in as superadmin, call:

```
POST /api/auth/staff
Authorization: Bearer <superadmin token>
{ "name": "Jane", "email": "jane@example.com", "password": "..." }
```

(A UI for this can be added inside the admin screen later — for now it's API-only to keep the first version focused on menu + orders.)

## Next steps (not yet implemented)

- Online payment gateway (Stripe/Razorpay/etc.) to move `paymentStatus` from `pending` to `paid` automatically.
- Push/real-time notifications for new orders (currently staff must pull-to-refresh).
- In-app UI for superadmin to create staff accounts.
