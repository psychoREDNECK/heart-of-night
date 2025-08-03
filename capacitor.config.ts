import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.pytoapk',
  appName: 'PyToApk',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3B82F6",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#3B82F6"
    }
  }
};

export default config;