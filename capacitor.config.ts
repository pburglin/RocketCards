import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rocketapps.rocketcards',
  appName: 'RocketCards',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
