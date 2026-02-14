"use client"

import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBX0qAqva8V4J-Y375pBlScnW_ydik-kXc",
  authDomain: "libproject-90bd6.firebaseapp.com",
  projectId: "libproject-90bd6",
  storageBucket: "libproject-90bd6.firebasestorage.app",
  messagingSenderId: "840388294133",
  appId: "1:840388294133:web:0e51d6020a6bc4d49e5cbc",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
