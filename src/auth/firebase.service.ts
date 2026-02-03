import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    if (!admin.apps.length) {
      // Validate required environment variables
      const requiredVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
      ];
      
      for (const varName of requiredVars) {
        if (!process.env[varName]) {
          throw new Error(`Missing required environment variable: ${varName}`);
        }
      }

      const creds = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(creds as any),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      
      this.logger.log('Initialized Firebase Admin successfully');
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
