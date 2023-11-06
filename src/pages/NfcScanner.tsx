import { Navbar, Button, Dialog, DialogButton, Link } from "konsta/react";
// import { Link } from "react-router-dom";
import { IonContent, IonIcon, IonPage, useIonRouter } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { NFCReader } from "../plugins/nfc-reader";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useAtom, atom } from "jotai";
import { RouteComponentProps } from "react-router";
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

const loadingAtom = atom(false);
const dialogAtom = atom(false);

interface NfcScannerProps
  extends RouteComponentProps<{
    hardwareInstallationId?: string;
    serialNumber?: string;
  }> {}

const NfcScanner: React.FC<NfcScannerProps> = ({ match }) => {
  const [code, setCode] = useState<string>("");
  const router = useIonRouter();

  const [findProduct] = useLazyQuery(FIND_PRODUCT_BY_SERIAL_NUMBER);
  const [isLoading, setIsLoading] = useAtom(loadingAtom);
  const [showErrorDialog, setShowErrorDialog] = useAtom(dialogAtom);
  const [installProduct] = useMutation(INSTALL_NEW_PRODUCT);

  NFCReader.addListener("nfcRead", ({ tagId }) => {
    setCode(tagId);
  });

  useEffect(() => {
    NFCReader.initNFCAdapter();

    return () => {
      NFCReader.removeAllListeners();
    };
  }, []);

  const redirectToDashboard = async () => {
    setIsLoading(true);
    const { data } = await findProduct({ variables: { serialNumber: code } });
    const productSerials = data?.product_serials;

    if (productSerials.length > 0) {
      if (
        !productSerials[0]?.hardware_installation &&
        !match.params?.hardwareInstallationId
      ) {
        // install new product
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
        router.push(`/dashboard/${code}`, "forward", "replace");
      }
    } else {
      setShowErrorDialog(true);
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    router.goBack();
  };

  return (
    <IonContent>
      <div className="flex flex-col h-full justify-between">
        <Navbar
          transparent={true}
          className="top-0 sticky"
          left={
            <Link className="p-4 flex items-center gap-1" onClick={handleBack}>
              <IonIcon icon={chevronBackOutline} size="small"></IonIcon>
              <p className="font-medium">Back</p>
            </Link>
          }
        />
        <div className="flex flex-col justify-center items-center px-8">
          <div className="flex flex-col justify-center items-center gap-4">
            <h1 className="text-2xl text-slate-800 font-bold">Scan NFC</h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="96"
              height="96"
              version="1.0"
              viewBox="0 0 1600 1600"
              className="opacity-10"
            >
              <path d="M269.7 1.1C213.2 6.1 158.9 27.5 113 63c-11.4 8.8-39.1 36.2-48.4 48-16.4 20.6-34 50.9-43.4 74.5-8.4 21.1-14.3 43-18.4 68l-2.3 14L.2 778c-.2 370.9 0 514.5.8 525 7 90.5 54.9 172.4 130.4 222.9 35.7 23.9 77.8 40.2 120.3 46.6 20.9 3.2 40.4 3.6 143.8 3.3l103-.3-5-2.9c-47.3-27.2-90-98-113.5-188-13.6-52.1-20-95.2-26.2-176.6-.9-11.6-1.3-156.3-1.5-571.9L352 79.7l5.9 5.4c3.3 3 145 143.3 315 311.9L982 703.5v192l-16.7-16.6c-27.6-27.2-366.2-363.7-428.8-426.1l-58-57.8-.3 302.8c-.3 305.6 0 338.7 3.4 395.7 7.6 128.9 25.7 225.1 55.8 296.8 5.8 13.8 19.5 40.4 27.1 52.7 15.6 25.1 43.4 56 64.8 71.9 35.7 26.6 77.9 44.9 132 57.1l17.7 4.1 263.3-.4c289.4-.3 266.7.2 298.3-6.2 96.1-19.4 178.7-89.3 214.8-181.6 8.6-22.1 14-43 18.3-70.9 1.6-10.8 1.8-41.3 2.1-518.5.2-345.4 0-511.7-.8-521.7-1.9-27.8-6.1-49-14.4-74.3C1523.2 89.9 1422.9 11.1 1304.5 1c-7.2-.6-55.5-1-120-1h-108l5.8 3.3c10 5.6 17.9 11.9 29.7 23.7 46.5 46.3 80.8 127.3 97.9 231 5.4 32.9 8.9 65.4 12.3 114.5.8 12.5 1.2 162.7 1.5 570.4l.4 553.3-3.9-3.3c-2.2-1.9-107.4-106-233.8-231.4S719.9 997.3 675.3 953L594 872.5V679.8l185.3 184.3c101.8 101.4 215.2 214.3 252 250.8l66.7 66.5V878.9c0-174.9-.4-315.3-1-332.9-5.7-179.4-27.4-299.2-69.5-383.8-15.3-30.8-31.1-53.6-52.5-75.6-22.1-22.7-44.1-38.6-73.5-53.1-26.6-13.1-53.6-22.3-88.3-30.1L797.8 0 538.2.1c-142.9.1-263.6.5-268.5 1z" />
            </svg>
            <p className="text-center text-slate-500 text-sm">
              Hold the NFC tag behind the phone to recognizing the hardware
            </p>
            <p className="text-center text-gray-400 uppercase">{code}</p>
          </div>
        </div>

        <div className={`px-4 mb-4 ${!code ? "invisible" : null}`}>
          <Button large onClick={redirectToDashboard} disabled={isLoading}>
            Next
          </Button>
        </div>

        <Dialog
          opened={showErrorDialog}
          onBackdropClick={() => setShowErrorDialog(false)}
          title="Product Not Found"
          content="Your product not found, please check your Tag ID"
          buttons={
            <DialogButton onClick={() => setShowErrorDialog(false)}>
              Ok
            </DialogButton>
          }
        />
      </div>
    </IonContent>
  );
};

export default NfcScanner;
