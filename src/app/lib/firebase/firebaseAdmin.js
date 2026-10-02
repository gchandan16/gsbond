// Purpose: Initialize Firebase Admin SDK for the backend (Server-Side)

import { getApps, initializeApp, cert } from 'firebase-admin/app';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

export default app;
