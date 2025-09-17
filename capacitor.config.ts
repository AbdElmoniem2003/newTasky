import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
import { Style } from '@capacitor/status-bar';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'newTasky',
  webDir: 'www', plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Default,
      resizeOnFullScreen: false,
    }, EdgeToEdge: {
      backgroundColor: "#ffffff"
    }, SplashScreen: {
      launchFadeOutDuration: 0,
      splashFullScreen: true,
      androidScaleType: "FIT_XY",
      splashImmersive: true
    }, StatusBar: {
      overlaysWebView: true,
    }
  }
};

export default config;
