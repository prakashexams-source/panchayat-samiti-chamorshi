# Panchayat Samiti Chamorshi — Next.js + Firebase

## 1. Install
Install Node.js LTS and VS Code.

## 2. Run
Open this folder in VS Code Terminal:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 3. Firebase
Create a Firebase project, add a Web App, enable:
- Authentication (Email/Password)
- Firestore Database
- Storage

Copy `.env.local.example` to `.env.local` and fill Firebase web config values.

## 4. Important
The `/admin` page included here is a LOCAL DEMO only. It uses browser localStorage so the design can be tested immediately. Before any official/public deployment, replace demo login and localStorage with Firebase Authentication, Firestore and Storage plus strict Security Rules.

## 5. Deploy
Push to GitHub and import the repository into Vercel. Add the same NEXT_PUBLIC_FIREBASE_* environment variables in Vercel.

## Suggested next development
1. Firebase Authentication
2. Firestore notice/news/events collections
3. PDF/photo uploads using Firebase Storage
4. Admin CRUD
5. Search
6. Live development dashboard
7. Official content, logo, officer photo, contact details and government links
