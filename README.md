# Patrol Hub

Patrol Hub is a single-repo React + Firebase web app for community patrol teams.

It includes:

- account creation with **admin approval** before access
- **live patrol start / end** tracking
- **shared map** showing active patrollers and alerts
- **time tracked** for the current patrol
- **route point recording** while a patrol is running
- **request assistance** alerts with quick directions links
- **planned route drawing** on the map for everyone to view
- **active patrollers list** with click-to-focus map behavior
- **tracking paused / last update** status for active patrollers
- **message board** with `@username` mentions
- dark matte black UI with glass panels and smooth transitions

---

## Tech stack

- **React + TypeScript + Vite**
- **Firebase Authentication** for email/password login
- **Cloud Firestore** for user profiles, patrols, posts, alerts, and routes
- **Leaflet / react-leaflet** for the map
- **GitHub Pages** workflow for front-end deployment

---

## Important note about notifications

This starter stays on the **free Firebase path** by using Firestore real-time listeners for alerts and mentions.

That means:

- while the app is **open**, users see alerts immediately
- if browser notifications are allowed, they can also see **browser notifications while the app is open**
- **true background push notifications** to every device are **not included in this free-only starter**

Why? Because secure FCM sending needs a **server-side sender**. The normal Firebase production path for that is a server environment or Cloud Functions. This repo is intentionally kept browser-only so you can start with the free version first.

---

## Important note about sign-in security

This repo uses **Firebase email/password auth** and keeps users signed in on the same device/browser so they do not have to log in every single time.

For **true MFA / 2FA** on Firebase web, Firebase's built-in MFA options are tied to **Firebase Authentication with Identity Platform**. Firebase's web docs currently document **SMS MFA** and **TOTP MFA** under that upgraded product, not a free browser-only email OTP flow.

So for this free starter:

- users stay signed in on the same browser/device
- if they close the browser and come back later, they should usually still be signed in
- I did **not** add a fake email OTP flow in the browser, because that would not be secure

If you want later, the two honest upgrade paths are:

1. **keep this repo free** and use password login only
2. **upgrade auth later** and add real MFA such as **TOTP**

---

## Important note about mobile browser behavior

This is a **web app**, not a native Android/iPhone app. That means:

- if the app stays open and active in Chrome/Safari, live location tracking can continue
- if the tab goes into the background, the phone is locked, or the browser suspends the page, browsers may throttle or pause timers and other page activity
- if the browser tab is closed, the app cannot keep sending location updates while it is closed
- when the user opens the app again, the existing signed-in session should restore and the patrol can resume in the UI

To reduce confusion, this repo now includes:

- persistent sign-in on the same browser/device
- a warning when a user tries to close the page during an active patrol
- automatic patrol resume in the UI if the user reopens the app and was already patrolling
- a visible warning that backgrounding the browser can pause tracking
- a stale-update status so active patrollers can show `Tracking paused · Last update Xm ago` when updates stop

---

## How the app is structured

### Firestore collections

- `users/{uid}`
  - approval state
  - role (`user` or `admin`)
  - last known live location
  - patrol status

- `usernames/{usernameLower}`
  - username reservation / uniqueness helper

- `patrols/{patrolId}`
  - patrol header document with start/end and duration

- `patrols/{patrolId}/points/{pointId}`
  - recorded route points during patrol

- `alerts/{alertId}`
  - assistance requests

- `plannedRoutes/{routeId}`
  - routes drawn by users for later patrol plans

- `posts/{postId}`
  - message board posts

- `mentions/{uid}/items/{mentionId}`
  - mention notifications generated from `@username`

---

## What you need before starting

You need:

1. a **GitHub account**
2. a **Firebase account/project**
3. **Node.js** installed on your computer
4. a phone or device with **GPS/location services** and a **data connection** for real patrol tracking

---

## Step-by-step setup guide

## Step 1: Download or copy this repo

Put this project in a folder on your computer.

Example folder name:

```bash
patrol-hub
```

---

## Step 2: Create your GitHub repository

1. Go to GitHub.
2. Create a new repository.
3. Name it something like `patrol-hub`.
4. Upload all files from this project into that repo.

If you know git already:

```bash
git init
git add .
git commit -m "Initial Patrol Hub setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 3: Create a Firebase project

1. Open the Firebase Console.
2. Click **Create a project**.
3. Give it a name.
4. You do **not** need Google Analytics for this starter.
5. Wait for the project to finish creating.

---

## Step 4: Add a Web App inside Firebase

1. Inside your Firebase project, click the **Web** icon (`</>`).
2. Register a web app.
3. Give it a nickname like `patrol-hub-web`.
4. Firebase will show you a config object.
5. Copy those values.

---

## Step 5: Create your local environment file

Copy `.env.example` to `.env.local`.

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

### macOS / Linux

```bash
cp .env.example .env.local
```

Open `.env.local` and replace the placeholder values with your real Firebase config.

Example:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_MAP_DEFAULT_LAT=-26.2041
VITE_MAP_DEFAULT_LNG=28.0473
VITE_MAP_DEFAULT_ZOOM=12
```

`VITE_MAP_DEFAULT_LAT/LNG/ZOOM` is just the default map opening view. Set this to your normal patrol area.

---

## Step 6: Enable Email/Password sign-in in Firebase Authentication

1. In Firebase Console, open **Authentication**.
2. Click **Get started**.
3. Open **Sign-in method**.
4. Enable **Email/Password**.
5. Save.

This app uses email + password for the first version.

---

## Step 7: Create Firestore Database

1. In Firebase Console, open **Firestore Database**.
2. Click **Create database**.
3. Choose a region close to your users.
4. Start in **production mode**.

---

## Step 8: Apply the Firestore rules and indexes

This repo already includes:

- `firestore.rules`
- `firestore.indexes.json`

### Easiest way for beginners

You can paste the rules manually:

1. Open **Firestore Database** → **Rules**.
2. Replace the existing rules with the contents of `firestore.rules`.
3. Click **Publish**.

For indexes, Firebase usually gives you a link when an index is missing. But this repo also includes `firestore.indexes.json` if you want to deploy them from the CLI.

### CLI way

Install dependencies first:

```bash
npm install
```

Then use Firebase CLI:

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

When asked, choose your Firebase project.

---

## Step 9: Run the app locally

Install packages:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open the local URL shown in the terminal.

Usually it will be:

```text
http://localhost:5173
```

---

## Step 10: Create the first account

1. Open the app.
2. Create your first user account.
3. It will be created as **pending approval**.

This is expected.

---

## Step 11: Make yourself the first admin

Because there is no admin yet on a brand new project, you must manually promote the first user once.

1. Open **Firestore Database**.
2. Open the `users` collection.
3. Open your user document.
4. Change:

```text
approved: true
role: admin
```

5. Refresh the app.

Now your account can:

- approve new users
- promote another admin
- resolve alerts
- access the Admin tab

---

## Step 12: Test the full flow

Now test these in order:

1. create a second account
2. approve it from the Admin tab
3. log into the second account
4. enable browser notifications
5. start a patrol on a phone/device with GPS enabled
6. request assistance
7. open another device/account and confirm the alert appears
8. draw and save a planned route
9. make a board post and tag someone using `@username`

---

## Step 13: Deploy to GitHub Pages

This repo includes:

```text
.github/workflows/deploy-pages.yml
```

That workflow builds the site and deploys it to GitHub Pages.

### Do this in GitHub

1. Open your GitHub repo.
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Add these repository secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_MAP_DEFAULT_LAT`
- `VITE_MAP_DEFAULT_LNG`
- `VITE_MAP_DEFAULT_ZOOM`

4. Go to **Settings** → **Pages**.
5. Under **Source**, choose **GitHub Actions**.
6. Push to `main` again if needed.

GitHub Actions will build and publish the site.

---

## GPS and patrol tracking notes

To start a patrol successfully, the user needs:

- device **GPS / location services enabled**
- browser **location permission allowed**
- a **data connection** if they want other patrollers to see movement in real time

Important behavior in this version:

- users can still **view the map and see others** without GPS
- users **cannot start patrol tracking** unless location access works
- the app shows a warning if GPS/location is blocked or unavailable

---

## How patrol tracking works in this starter

When **Start patrol** is clicked:

1. the app asks the browser/device for location access
2. it creates a patrol document
3. it starts a live GPS watch
4. it updates the user’s current location in Firestore
5. it saves route points into `patrols/{patrolId}/points`
6. it starts the on-screen timer

When **End patrol** is clicked:

1. the GPS watch stops
2. the patrol is marked inactive
3. the duration is saved
4. the user is removed from the active patrol list

---

## Current free-version limitations

These are honest limitations of the browser-only free version:

### 1. Background push notifications are not included

If the site is closed, users will not receive reliable server-pushed emergency alerts yet.

### 2. Route storage can grow over time

If many patrols run often, the `points` subcollection will grow. Later you may want to:

- archive old patrols
- export patrol history
- sample fewer GPS points

### 3. No photo uploads yet

This starter is focused on live patrol location, alerts, routes, and board posts.

### 4. No offline queue yet

If a device loses signal, live updates may pause until data returns.

---

## Good next upgrades after this first version

When you are ready, the next best features to add are:

1. **true background push notifications** using a secure server-side sender
2. **private or direct messages**
3. **patrol history page** with per-user summaries
4. **photo attachments** for alerts/posts
5. **admin-only route management**
6. **panic countdown / siren mode**
7. **geofenced patrol zones**
8. **PWA install mode** for better phone use

---

## Useful files in this repo

- `src/App.tsx` → main app logic
- `src/components/MapPanel.tsx` → shared live map
- `src/components/AuthScreen.tsx` → login and signup UI
- `firestore.rules` → Firestore security rules
- `firestore.indexes.json` → Firestore indexes
- `.github/workflows/deploy-pages.yml` → GitHub Pages deployment workflow

---

## Final beginner tip

Do not try to understand every file first.

Start in this order:

1. get Firebase working
2. run the app locally
3. make your first admin account
4. test live tracking on two devices
5. only then start changing UI text, colors, or features

That order will save you a lot of confusion.


## Behaviour FAQ

### If I keep Chrome or Safari open on my phone, will it work?

Usually yes, **while the page stays active and the device keeps the browser running**. GPS and mobile data both need to be available for fresh live updates.

### If I switch from Chrome to WhatsApp and come back, what happens?

The page usually remains loaded, but location updates can pause while the browser is in the background. When the user comes back, the page can continue and the patrol can resume updating.

### If I accidentally close the browser, will I still be signed in?

Usually yes on the same device/browser, because Firebase web auth persists the session locally.

### If I accidentally close the browser during patrol, does the patrol end automatically?

No. The patrol remains active in Firestore until the user ends it. This avoids losing a patrol just because someone closed the browser by mistake. The trade-off is that location updates stop while the page is closed, so there can be a gap in the route history until the user opens the app again.

### Will the map stop working if the browser is closed?

Your own device cannot continue sending fresh location updates while the page is closed. Other users can still open the app and see the last shared state that was already written to Firebase.


## Do I need Firebase Hosting?

No. This repo is set up for **GitHub Pages** deployment. You only need Firebase for Authentication and Firestore.

## Do I need GitHub Secrets?

Not for this version. The Firebase web config is already included, so the GitHub Pages workflow can build without adding repository secrets.
