# FabriCraft

**Crafting satisfaction in every stitch — timeless elegance and comfort.**

**Live site:** [https://fabricraft.netlify.app/](https://fabricraft.netlify.app/)

FabriCraft is a modern, full-featured e-commerce web application for premium clothing. Built with React, it offers a smooth shopping experience with product browsing, wishlist, cart, checkout, order tracking, and an admin panel for store management.

---

## Live Site

**https://fabricraft.netlify.app/**

---

## Features

### Customer-facing

| Feature | Description |
|--------|-------------|
| **Home** | Hero, category highlights, and featured products |
| **Shop** | Browse all products with optional query filters |
| **Categories** | Category listing and category-specific product pages |
| **Product page** | Product details, images, reviews, add to cart/wishlist |
| **Search** | Full search across products |
| **Wishlist** | Save items for later (persisted in localStorage) |
| **Cart** | Cart management and quantity updates |
| **Checkout** | Delivery details, checkout flow, and order confirmation |
| **Order success** | Confirmation screen after placing an order |
| **Order history** | View past orders and order details |
| **Profile** | User profile and account-related actions |
| **Offers** | Promotional offers and deals |
| **Auth** | Login/registration (Firebase-backed where configured) |

### Admin panel

- **Dashboard** — Overview and quick actions  
- **Product management** — Add, edit, and manage products  
- **Order management** — View and manage orders; order details view  
- **Review management** — Moderate product reviews  
- **Search management** — Admin search tools  

Protected under a dedicated admin path and secret (see [Environment variables](#environment-variables)).

### Technical highlights

- **Firebase** — Firestore, Storage, Analytics  
- **Backend API** — REST API for products, orders, and auth (see `REACT_APP_BACKEND_SERVER`)  
- **Email** — Transactional/contact emails via EmailJS  
- **Analytics** — Meta Pixel (Facebook) for events and page views  
- **PWA-ready** — `manifest.json` and app-like experience  
- **Responsive** — Mobile-first layout with bottom nav on small screens  

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **UI** | React 18, React Router v6, React Bootstrap, Bootstrap 5 |
| **State & data** | React Context (Auth, Data), TanStack React Query, Axios |
| **Forms & validation** | React Hook Form, Yup, @hookform/resolvers |
| **Backend / services** | Firebase (Firestore, Storage, Analytics), custom REST API |
| **Email** | EmailJS (browser) |
| **Utilities** | date-fns, crypto-js, BlurHash (react-blurhash), Font Awesome |
| **Build** | Create React App (react-scripts) |

---

## Project structure (high-level)

```
OnlyReactEcom/
├── public/                 # Static assets, manifest, favicon
├── src/
│   ├── assets/             # Images, styles (CSS)
│   ├── components/         # Pages & UI components (Home, Cart, Admin, etc.)
│   ├── contexts/           # AuthContext, DataContext
│   ├── containers/         # PrivateOutlet, AdminOutlet (route guards)
│   ├── utils/              # Helpers, Meta Pixel, common utils
│   ├── App.js              # Routes and app shell
│   ├── firebaseConfig.js   # Firebase init and exports
│   └── index.js
├── env.example             # Template for environment variables
├── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** 16+ (recommended: 18 or 20)
- **npm** or **yarn**

---

## Getting started

### 1. Clone and install

```bash
git clone <repository-url>
cd OnlyReactEcom
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp env.example .env
```

Edit `.env` with your actual keys and URLs. **Do not commit `.env`** (it should be in `.gitignore`).

| Variable | Purpose |
|----------|--------|
| `REACT_APP_FIREBASE_*` | Firebase project (API key, auth domain, project ID, storage, messaging, app ID, measurement ID) |
| `REACT_APP_BACKEND_SERVER` | Base URL of your backend API (e.g. `https://your-api.com/api/`) |
| `REACT_APP_ADMIN_PANEL_PATH` | URL path for admin panel (e.g. `/fabricraft-super-admin-panel/`) |
| `REACT_APP_ADMIN_SECRET` / `REACT_APP_ADMIN_SUPER_SECRET` | Admin access secrets |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `REACT_APP_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | EmailJS template ID |

### 3. Run locally

```bash
npm start
```

App runs at **http://localhost:3000**.

### 4. Build for production

```bash
npm run build
```

Output is in the `build/` folder, ready to deploy (e.g. to Netlify).

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (port 3000) |
| `npm run build` | Production build into `build/` |
| `npm test` | Run tests in watch mode |
| `npm run eject` | Eject from Create React App (one-way; not recommended unless needed) |

---

## Deployment (Netlify)

The project is deployed at **https://fabricraft.netlify.app/**.

- **Build command:** `npm run build`  
- **Publish directory:** `build`  
- **Environment variables:** Set all `REACT_APP_*` (and any other required vars) in the Netlify dashboard under **Site settings → Environment variables**.

For local builds, ensure `.env` is populated; for CI/Netlify, use the dashboard or linked repo env config.

---

## Browser support

Aligned with Create React App defaults: modern evergreen browsers (Chrome, Firefox, Safari, Edge). Production targets: `>0.2%`, not dead, not op_mini all.

---

## License

This project is private. All rights reserved.

---

## Acknowledgments

- Bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
- UI: [React Bootstrap](https://react-bootstrap.github.io/), [Bootstrap](https://getbootstrap.com/)
- Icons: [Font Awesome](https://fontawesome.com/)
- Fonts: [Google Fonts — Roboto](https://fonts.google.com/specimen/Roboto)
