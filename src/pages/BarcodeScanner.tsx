import {
  Barcode,
  BarcodeScanner as BarcodeScan,
} from "@capacitor-mlkit/barcode-scanning";
import { Navbar, Link, Sheet, Block, Button, Page } from "konsta/react";
import { IonIcon, useIonRouter } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { RouteComponentProps } from "react-router";

const barcodeAtom = atom<{
  isSupported: boolean;
  barcodes: Barcode[];
  unpermitted: boolean;
  result: Barcode | undefined | null;
}>({
  isSupported: false,
  barcodes: [],
  unpermitted: false,
  result: null,
});

const sheetAtom = atom(false);

interface BarcodeScannerProps
  extends RouteComponentProps<{
    hardwareInstallationId?: string;
  }> {}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ match }) => {
  const [barcode, setBarcode] = useAtom(barcodeAtom);
  const [showSheet, setShowSheet] = useAtom(sheetAtom);
  const router = useIonRouter();

  useEffect(() => {
    BarcodeScan.isSupported().then(async (result) => {
      setBarcode({
        ...barcode,
        isSupported: result.supported,
      });

      const granted = await requestPermission();
      if (!granted) {
        setBarcode({
          ...barcode,
          unpermitted: true,
        });

        return;
      }

      const listener = await BarcodeScan.addListener(
        "barcodeScanned",
        async (result) => {
          await listener.remove();
          document
            .querySelector("body")
            ?.classList.remove("barcode-scanner-active");

          await BarcodeScan.stopScan();

          setBarcode({
            ...barcode,
            result: result.barcode,
          });

          // TODO: check if the serial number is not registered yet in the database
          setShowSheet(true);

          // router.push(`/dashboard/${result.barcode}`, "forward", "replace");
        }
      );

      document.querySelector("body")?.classList.add("barcode-scanner-active");

      await BarcodeScan.startScan();
    });
  }, []);

  const requestPermission = async () => {
    const { camera } = await BarcodeScan.requestPermissions();
    return camera === "granted" || camera === "limited";
  };

  const handleStopScan = async () => {
    await BarcodeScan.removeAllListeners();
    document.querySelector("body")?.classList.remove("barcode-scanner-active");
    await BarcodeScan.stopScan();
    router.goBack();
  };

  const handleCloseSheet = () => {
    setShowSheet(false);
    router.goBack();
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <Navbar
        transparent={true}
        className="top-0 sticky"
        left={
          <Link
            onClick={handleStopScan}
            className="p-4 flex items-center gap-1"
          >
            <IonIcon icon={chevronBackOutline} size="small"></IonIcon>
            <p className="font-medium">Back</p>
          </Link>
        }
      />

      <Sheet
        className="pb-safe w-full"
        opened={showSheet}
        onBackdropClick={handleCloseSheet}
      >
        <Block>
          <p>Result: {barcode.result?.rawValue}</p>
          <div className="mt-4">
            <Button onClick={handleCloseSheet}>Action</Button>
          </div>
        </Block>
      </Sheet>
    </div>
  );
};

export default BarcodeScanner;
