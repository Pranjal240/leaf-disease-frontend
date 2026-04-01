import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aimadhu.leafdisease',
  appName: 'AI MADHU',
  webDir: 'dist',
  server: {
    // For development: uncomment and set to your backend IP
    // cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
