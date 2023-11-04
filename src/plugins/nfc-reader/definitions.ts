import type { PluginListenerHandle } from "@capacitor/core";

export interface NFCReaderPlugin {
  initNFCAdapter(): Promise<void>;

  addListener(
    eventName: "nfcRead",
    listenerFunc: ({ tagId }: { tagId: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  removeAllListeners(): Promise<void>;
}
