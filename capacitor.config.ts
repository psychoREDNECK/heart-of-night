import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.heartofnight.app',
  appName: 'Heart of Night',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
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
    }
  }
};

export default config;