import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (!admin.apps.length) {
      const creds = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
      admin.initializeApp({
        credential: admin.credential.cert(creds as any),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.log('Initialized Firebase Admin');
    }
  }

  get auth() {
    return admin.auth();
  }

  get storage() {
    return admin.storage().bucket();
  }

  get firestore() {
    return admin.firestore();
  }
}
