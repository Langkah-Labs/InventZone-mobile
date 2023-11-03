import { registerPlugin } from "@capacitor/core";

import type { NFCReaderPlugin } from "./definitions";

const NFCReader = registerPlugin<NFCReaderPlugin>("NFCReader");

export * from "./definitions";
export { NFCReader };
