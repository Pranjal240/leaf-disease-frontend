import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aimadhu.leafdisease',
  appName: 'AI MADHU',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'leaf-disease-backend-us.onrender.com',
      '*.onrender.com'
    ]
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
