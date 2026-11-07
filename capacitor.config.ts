import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.endlessorbit.game',
  appName: 'Endless Orbit',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#050711'
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;

