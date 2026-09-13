# Deploying Sparkathon (PC-free, free tier)

Two Render web services (Docker) + MongoDB Atlas. Result: a permanent public URL
that works with your laptop off.

Architecture: **one** Node "gateway" service serves the React frontend, exposes
the API, and proxies the **nav** service. Recommendations use the built-in
Jaccard scorer (no separate Python recommender needed in production).

---

## 1. MongoDB Atlas (database) — free

1. Create a free account at https://www.mongodb.com/atlas and a **free M0 cluster**.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`).
4. **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
5. Insert the database name `sparkathon` before the `?`:
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/sparkathon?retryWrites=true&w=majority`
   Keep this — it's your **DB_LOCATION**.

## 2. Seed the catalog into Atlas (one time)

From the repo on your machine:
```bash
cd "Backend Mongo"
DB_LOCATION="<your Atlas string from step 1>" node seed/seedLayout.js
```
You should see "Seeded 40 products … + layout."

## 3. Render (hosting) — free

1. Create a free account at https://render.com and connect your GitHub.
2. **New → Blueprint** → pick the `Sparkathon` repo → Render reads `render.yaml`
   and proposes **two services** (`sparkathon-nav`, `sparkathon-web`). Apply.
3. Let **sparkathon-nav** finish deploying first. Copy its URL
   (e.g. `https://sparkathon-nav.onrender.com`).
4. Open **sparkathon-web → Environment** and set:
   - `DB_LOCATION` = your Atlas string (step 1)
   - `ADMIN_KEY` = `1234` (must match the editor PIN baked into the frontend)
   - `NAV_URL` = the nav URL from step 3
   - (`SECRET_ACCESS_KEY` is auto-generated; `RECOMMENDER_URL` stays empty)
5. **Manual Deploy → Deploy latest** on sparkathon-web.

## 4. Use it

Open the **sparkathon-web** URL — that's your live storefront. Generate a QR for
that URL (any QR tool) and you're set.

- Manager editor: `/editor`, passcode `1234`.
- Health check: `/all-products` should return JSON.

---

## Notes & caveats
- **Cold start:** Render free services sleep after ~15 min idle; the first
  request then takes ~30–60s. Open the site once a couple minutes before a demo.
- **Changing the manager PIN:** edit the PIN in `deploy/Dockerfile.web`
  (the `VITE_MANAGER_PIN` line) **and** set `ADMIN_KEY` to the same value.
- **Security:** `/save-layout` is protected by `ADMIN_KEY`; the rest of the API
  is public read/cart. Fine for a demo; a real launch needs proper accounts.
- **TF-IDF recommender:** optional. To use the Python TF-IDF service in prod,
  deploy `Recommender/` as a third service and set `RECOMMENDER_URL` to its URL.
