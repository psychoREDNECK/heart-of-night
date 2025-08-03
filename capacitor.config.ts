import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.heartofnight.app',
  appName: 'Heart of Night',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'https://code-assimilation-psychoredneck12.replit.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0D1117",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0D1117"
    },
    Filesystem: {
      ioTimeout: 15000
    },
    Camera: {
      permissions: {
        camera: "Camera access is required to take photos.",
        photos: "Photo library access is required to select images."
      }
    }
  }
};

export default config;