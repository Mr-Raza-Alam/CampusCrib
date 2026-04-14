# 🎓 CampusCrib

**The campus crib — Find safe, verified, and affordable accommodation near your college. Built for students, by students.**

![CampusCrib Banner](https://img.shields.io/badge/Status-Active-success)
![NodeJS](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

---

## 🚀 About The Project

Finding a good PG, hostel, or flat near your college can be a daunting experience. CampusCrib solves this by providing a clean, centralized platform where property owners can list their accommodations and students can securely find, verify, and contact them. 

The project leverages a modern monolithic repository structure with a dedicated **React 19 Frontend** and a **Node.js/Express Backend**.

## 🛠️ Tech Stack

### Frontend Ecosystem (`/client`)
- **Core:** React 19 bootstrapped with Vite
- **Routing:** React Router v7
- **Authentication:** Firebase Client SDK
- **Maps Interface:** Mapbox GL for interactive property location viewing
- **Utilities:** Axios (Requests), Browser Image Compression
- **Linting:** ESLint 9

### Backend Architecture (`/server`)
- **Core:** Node.js, Express v5
- **Database:** MongoDB via Mongoose v9
- **Storage:** Cloudinary (via `multer-storage-cloudinary`)
- **Security:** Helmet, express-mongo-sanitize, express-rate-limit, CORS
- **Auth/Sessions:** Firebase Admin SDK, express-session (with `connect-mongo`)
- **AI Integrations:** Google GenAI SDK integration

## ⭐ Key Features

- 🧑‍🎓 **Student Hub:** Intuitive dashboards for students to browse properties and filter by distance map integration.
- 🏢 **Property Owner Dashboard:** Simple workflow to add listings, upload and compress images, and manage availability.
- 🗺️ **Interactive Maps:** Discover property locations accurately using seamless Mapbox integration.
- 🔒 **Enterprise-Grade Auth:** Secure Firebase authentication tightly coupled with resilient backend express sessions.
- 🖼️ **Optimized Media:** Automatic client-side image compression and permanent hosting on Cloudinary.
- 🛡️ **Robust Security:** Pre-configured rate limiting, payload sanitation, and helmet headers to prevent vulnerabilities.

---

## 📂 Project Structure

```text
CampusCrib/
├── client/              # React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, Lists, etc.)
│   │   ├── pages/       # Next-gen page routing (Student, Owner, Admin Dashboards)
│   │   └── ...
│   └── package.json
│
└── server/              # Node.js Express API
    ├── config/          # Configurations for Cloudinary, DB, etc.
    ├── middleware/      # Auth gates and security handlers
    ├── models/          # Mongoose Schema Definitions
    ├── routes/          # Express route structures
    ├── seed/            # DB seed generator scripts
    ├── app.js           # Express App Entry Point
    └── package.json
```

---

## ⚙️ Local Development Setup

To get a local copy up and running, follow these simple steps.

### 1. Clone the repository
```bash
git clone https://github.com/Mr-Raza-Alam/CampusCrib.git
cd CampusCrib
```

### 2. Configure & Start the Backend Server
```bash
cd server
npm install
```
**Environment Variables (`server/.env`):**
Create a `.env` file in the `server` directory (you can copy `.env.example`) and fill in:
```env
PORT=3000
MONGODB_URI=your_mongodb_cluster_url
SESSION_SECRET=your_super_secret_key

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google AI
GEMINI_API_KEY=your_genai_key
```
**Start the backend server:**
```bash
npm run dev
```

### 3. Configure & Start the Frontend Web App
Open a new terminal session and set up the client side.
```bash
cd client
npm install
```
**Environment Variables (`client/.env.local`):**
Create a `.env.local` file in the client directory and add your keys:
```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
# Include other related Firebase Client keys
```
**Start the React dev server:**
```bash
npm run dev
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the ISC License. See `package.json` for more information.
