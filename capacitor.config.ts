import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.keydrop.app",
  appName: "KeyDrop",
  webDir: "out",
  backgroundColor: "#0a0a0a",
  server: {
    url: "https://1-2clicks.vercel.app",
    cleartext: false,
  },
  ios: {
    scheme: "KeyDrop",
    contentInset: "automatic",
    backgroundColor: "#0a0a0a",
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0a0a0a",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
