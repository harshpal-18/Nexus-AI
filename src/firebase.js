import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCURltlHcNyo6JnKEDX_tNx7kXvOmZUmhQ",
  authDomain: "task-planner-6f21c.firebaseapp.com",
  projectId: "task-planner-6f21c",
  storageBucket: "task-planner-6f21c.firebasestorage.app",
  messagingSenderId: "262140708513",
  appId: "1:262140708513:web:7efab4a483ce3e924652e0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();