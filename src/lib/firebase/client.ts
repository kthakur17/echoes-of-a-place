"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
  type Auth,
} from "firebase/auth";

/**
 * Client-side Firebase (Auth only — all Firestore access goes through the
 * server with the Admin SDK). The NEXT_PUBLIC_* config values are public by
 * design; access control is enforced by Firestore rules and server-side
 * token verification, never by hiding these values.
 */

function getClientApp(): FirebaseApp {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

export function clientAuth(): Auth {
  return getAuth(getClientApp());
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(clientAuth(), new GoogleAuthProvider());
}

export async function signInAsGuest(): Promise<void> {
  await signInAnonymously(clientAuth());
}

export async function signOut(): Promise<void> {
  await fbSignOut(clientAuth());
}
