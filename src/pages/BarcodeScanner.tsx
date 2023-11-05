import {
  Barcode,
  BarcodeScanner as BarcodeScan,
} from "@capacitor-mlkit/barcode-scanning";
import { Link, Dialog, DialogButton } from "konsta/react";
import { IonIcon, useIonRouter } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { RouteComponentProps } from "react-router";
import { useLazyQuery, gql, useMutation } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";

const FIND_PRODUCT_BY_SERIAL_NUMBER = gql`
  query FindProductBySerialNumber($serialNumber: String!) {
    product_serials(
      where: { serial_number: { _eq: $serialNumber } }
      limit: 1
    ) {
      id
      product {
        id
        name
      }
      installed_at
      capacity
      capacity_remaining
      hardware_installation {
        hardware_installation_id
      }
    }
  }
`;

const INSTALL_NEW_PRODUCT = gql`
  mutation InstallNewProduct(
    $hardwareInstallationId: String!
    $productSerialId: bigint!
    $installedAt: timestamptz = "now()"
  ) {
    insert_hardware_installations_one(
      object: {
        hardware_installation_id: $hardwareInstallationId
        product_serial_id: $productSerialId
      }
    ) {
      id
      hardware_installation_id
      product_serial_id
      created_at
      updated_at
    }

    update_product_serials_by_pk(
      pk_columns: { id: $productSerialId }
      _set: { installed_at: $installedAt }
    ) {
      id
      created_at
      updated_at
      installed_at
    }
  }
`;

const barcodeAtom = atom<{
  result: Barcode | undefined | null;
}>({
  result: null,
});

const successDialogAtom = atom(false);
const errorDialogAtom = atom(false);

interface BarcodeScannerProps
  extends RouteComponentProps<{
    hardwareInstallationId?: string;
    serialNumber?: string;
  }> {}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ match }) => {
  const [barcode, setBarcode] = useAtom(barcodeAtom);
  const [showErrorDialog, setShowErrorDialog] = useAtom(errorDialogAtom);
  const [showSuccessDialog, setShowSuccessDialog] = useAtom(successDialogAtom);
  const router = useIonRouter();
  const [findProduct, { data: productData }] = useLazyQuery(
    FIND_PRODUCT_BY_SERIAL_NUMBER
  );
  const [installProduct] = useMutation(INSTALL_NEW_PRODUCT);

  useEffect(() => {
    BarcodeScan.isSupported().then(async (result) => {
      if (result.supported) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }

        document.querySelector("body")?.classList.add("barcode-scanner-active");
        await BarcodeScan.addListener("barcodeScanned", async (result) => {
          setBarcode({
            ...barcode,
            result: result.barcode,
          });

          const { data } = await findProduct({
            variables: { serialNumber: result.barcode.rawValue },
          });
          const productSerials = data?.product_serials;
          if (productSerials.length > 0) {
            setShowSuccessDialog(true);
          } else {
            setShowErrorDialog(true);
          }
        });

        await BarcodeScan.startScan();
      }
    });

    return () => {
      (async () => {
        await BarcodeScan.removeAllListeners();
      })();
    };
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

  const redirectToDashboard = async () => {
    const productSerials = productData?.product_serials;
    console.log("PRODUCT SERIALS ====>>", JSON.stringify(productSerials));

    if (productSerials.length > 0) {
      if (
        !productSerials[0]?.hardware_installation &&
        !match.params?.hardwareInstallationId
      ) {
        const newId = uuidv4();
        await installProduct({
          variables: {
            hardwareInstallationId: newId,
            productSerialId: productSerials[0]?.id,
          },
        });
      }

      if (
        !productSerials[0]?.hardware_installation &&
        match.params?.hardwareInstallationId
      ) {
        const hardwareInstallationId = match.params?.hardwareInstallationId;
        await installProduct({
          variables: {
            hardwareInstallationId,
            productSerialId: productSerials[0]?.id,
          },
        });
      }

      if (match.params.serialNumber) {
        router.push(
          `/dashboard/${match.params.serialNumber}`,
          "forward",
          "replace"
        );
      } else {
        router.push(
          `/dashboard/${barcode.result?.rawValue}`,
          "forward",
          "replace"
        );
      }
    }

    await BarcodeScan.removeAllListeners();
    document.querySelector("body")?.classList.remove("barcode-scanner-active");
    await BarcodeScan.stopScan();
  };

  return (
    <>
      <Link
        onClick={handleStopScan}
        className="top-0 sticky w-fit m-4 p-4 flex items-center gap-1 bg-white rounded-full shadow-sm"
      >
        <IonIcon icon={chevronBackOutline} size="small"></IonIcon>
      </Link>

      <Dialog
        opened={showSuccessDialog}
        onBackdropClick={() => setShowSuccessDialog(false)}
        title="Product Found"
        content={`Serial number with id ${barcode.result?.rawValue} found! Do you want to continue?`}
        buttons={
          <>
            <DialogButton onClick={() => setShowSuccessDialog(false)}>
              No
            </DialogButton>
            <DialogButton strong onClick={redirectToDashboard}>
              Yes
            </DialogButton>
          </>
        }
      />

      <Dialog
        opened={showErrorDialog}
        onBackdropClick={() => setShowErrorDialog(false)}
        title="Product Not Found"
        content={`Your product ${barcode.result?.rawValue} not found, please check your Barcode/QR Code`}
        buttons={
          <DialogButton onClick={() => setShowErrorDialog(false)}>
            Ok
          </DialogButton>
        }
      />
    </>
  );
};

export default BarcodeScanner;
