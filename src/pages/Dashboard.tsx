import {
  Navbar,
  Button,
  List,
  ListItem,
  BlockTitle,
  Popup,
  Link,
  ListInput,
  Radio,
  Preloader,
  Block,
} from "konsta/react";
import { IonContent, IonIcon, useIonRouter } from "@ionic/react";
import {
  hammerOutline,
  personAddOutline,
  documentOutline,
  cameraOutline,
  qrCodeOutline,
} from "ionicons/icons";
import { atom, useAtom, useSetAtom } from "jotai";
import { gql } from "@apollo/client";
import { RouteComponentProps } from "react-router";
import { useQuery, useLazyQuery } from "@apollo/client";
import { useEffect } from "react";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(LocalizedFormat);

const popupAtom = atom(false);
const radioGroupAtom = atom("");

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

const FIND_HARDWARE_INSTALLATIONS_BY_ID = gql`
  query FindHardwareInstallationById(
    $hardwareInstallationId: String!
    $serialNumber: String!
  ) {
    hardware_installations(
      where: {
        hardware_installation_id: { _eq: $hardwareInstallationId }
        product_serial: { serial_number: { _neq: $serialNumber } }
      }
    ) {
      id
      hardware_installation_id
      product_serial {
        id
        product {
          id
          name
        }
        installed_at
        serial_number
      }
    }
  }
`;

const ProductData: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useAtom(popupAtom);

  const [groupValue, setGroupValue] = useAtom(radioGroupAtom);

  return (
    <Popup opened={isPopupOpen} onBackdropClick={() => setIsPopupOpen(false)}>
      <Navbar
        title="Update Data"
        right={
          <Link navbar onClick={() => setIsPopupOpen(false)}>
            Save
          </Link>
        }
      />
      <IonContent>
        <BlockTitle>Location Data</BlockTitle>
        <List>
          <ListInput
            outline
            label="Location"
            type="text"
            placeholder="Location"
            disabled
          />
          <div className="mx-4 mt-2">
            <Button>Get Location</Button>
          </div>
        </List>

        <BlockTitle>Port</BlockTitle>
        <List>
          <ListItem
            label
            title="8"
            media={
              <Radio
                component="div"
                value="8"
                checked={groupValue === "8"}
                onChange={() => setGroupValue("8")}
              />
            }
          />
          <ListItem
            label
            title="16"
            media={
              <Radio
                component="div"
                value="16"
                checked={groupValue === "16"}
                onChange={() => setGroupValue("16")}
              />
            }
          />
        </List>

        <BlockTitle>General Information</BlockTitle>
        <List>
          <ListInput
            outline
            label="Product Name"
            type="text"
            placeholder="Product Name"
          />
          <ListInput
            outline
            label="Central Office Name"
            type="text"
            placeholder="Central Office Name"
          />
          <ListInput
            outline
            label="Power Signal"
            type="text"
            placeholder="Power Signal"
          />
        </List>
      </IonContent>
    </Popup>
  );
};

interface DashboardPageProps
  extends RouteComponentProps<{
    serialNumber: string;
  }> {}

const Dashboard: React.FC<DashboardPageProps> = ({ match }) => {
  const router = useIonRouter();
  const setIsPopupOpen = useSetAtom(popupAtom);
  const {
    loading: productDataLoading,
    error: productDataError,
    data: productData,
  } = useQuery(FIND_PRODUCT_BY_SERIAL_NUMBER, {
    variables: {
      serialNumber: match.params.serialNumber,
    },
  });
  const [
    getHardwareInstallations,
    {
      loading: hardwareInstallationLoading,
      error: hardwareInstallationError,
      data: hardwareInstallationData,
    },
  ] = useLazyQuery(FIND_HARDWARE_INSTALLATIONS_BY_ID);

  useEffect(() => {
    (async () => {
      if (productData) {
        const product = productData["product_serials"][0] || {};
        const hardwareInstallationId =
          product["hardware_installation"]["hardware_installation_id"] || "";

        if (product) {
          await getHardwareInstallations({
            variables: {
              serialNumber: match.params.serialNumber,
              hardwareInstallationId,
            },
          });
        }
      }
    })();
  }, [productData]);

  const handleUpdateData = () => {
    setIsPopupOpen((prev) => !prev);
  };

  const handleCustomers = () => {
    router.push("/customers");
  };

  const handleAttachProduct = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Invent Zone" centerTitle className="top-0 sticky" />

      <IonContent>
        <div className="flex flex-col rounded bg-white border border-slate-100 shadow-sm p-4 m-4">
          {productDataLoading ? (
            <Block className="text-center">
              <Preloader />
            </Block>
          ) : (
            <>
              <h1 className="text-black font-bold text-lg">
                {productData?.product_serials[0]?.product?.name || ""}
              </h1>
              <p className="text-slate-500 text-md">
                {dayjs(productData?.product_serials[0]?.installed_at).format(
                  "LL"
                ) || ""}
              </p>
            </>
          )}
        </div>

        <div className="flex mx-4 gap-2 overflow-x-scroll md:overflow-auto border rounded border-slate-100 shadow-sm">
          <Button
            outline
            large
            onClick={handleAttachProduct}
            className="flex flex-col w-28 h-28 justify-center items-center gap-2 p-4 rounded text-xs font-medium text-center"
          >
            <IonIcon icon={hammerOutline} className="w-6 h-6"></IonIcon>
            Attach Product
          </Button>

          <Button
            outline
            large
            onClick={handleCustomers}
            className="flex flex-col w-28 h-28 justify-center items-center gap-2 p-4 rounded text-xs font-medium text-center"
          >
            <IonIcon icon={personAddOutline} className="w-6 h-6"></IonIcon>
            Customers Data
          </Button>

          <Button
            outline
            large
            onClick={handleUpdateData}
            className="flex flex-col w-28 h-28 justify-center items-center gap-2 p-4 rounded text-xs font-medium text-center"
          >
            <IonIcon icon={documentOutline} className="w-6 h-6"></IonIcon>
            Update Data
          </Button>

          <Button
            outline
            large
            className="flex flex-col w-28 h-28 justify-center items-center gap-2 p-4 rounded text-xs font-medium text-center"
          >
            <IonIcon icon={cameraOutline} className="w-6 h-6"></IonIcon>
            Upload Photo
          </Button>
        </div>

        {hardwareInstallationLoading ? (
          <Block className="text-center">
            <Preloader />
          </Block>
        ) : (
          <>
            <BlockTitle>Linked Products</BlockTitle>
            <List dividersMaterial>
              {hardwareInstallationData?.hardware_installations?.map(
                (hw: any) => {
                  return (
                    <ListItem
                      key={hw?.id}
                      link
                      header={
                        dayjs(hw?.product_serial?.installed_at).format("LL") ||
                        ""
                      }
                      title={hw?.product_serial?.product?.name || ""}
                      footer={hw?.product_serial?.serial_number || ""}
                      titleWrapClassName="font-bold"
                      chevronIcon={
                        <IonIcon
                          icon={qrCodeOutline}
                          className="h-6 w-6"
                        ></IonIcon>
                      }
                    />
                  );
                }
              )}
            </List>
          </>
        )}
      </IonContent>

      <ProductData />
    </div>
  );
};

export default Dashboard;
