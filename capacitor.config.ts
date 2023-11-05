import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "InventZone-Mobile",
  webDir: "dist",
  server: {
    // TODO: change it to https when the app was deployed to the production
    androidScheme: "http",
    cleartext: true,
  },
};

export default config;
