import { createRoot } from "react-dom/client";
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import App from "./App";
import "./index.css";

// Initialize Capacitor plugins for mobile
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: 'DARK' } as any);
  SplashScreen.hide();
}

createRoot(document.getElementById("root")!).render(<App />);
