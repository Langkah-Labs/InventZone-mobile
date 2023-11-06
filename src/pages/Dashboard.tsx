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
  Dialog,
  DialogButton,
} from "konsta/react";
import { IonContent, IonIcon, useIonRouter } from "@ionic/react";
import {
  hammerOutline,
  personAddOutline,
  documentOutline,
  cameraOutline,
} from "ionicons/icons";
import { atom, useAtom, useSetAtom, useAtomValue } from "jotai";
import { gql, useMutation } from "@apollo/client";
import { RouteComponentProps } from "react-router";
import { useQuery, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Geolocation } from "@capacitor/geolocation";
import {
  NativeGeocoder,
  NativeGeocoderResult,
} from "@ionic-native/native-geocoder";
import { Camera, CameraResultType } from "@capacitor/camera";
import inventZoneLogo from "../../resources/logo.png";

dayjs.extend(LocalizedFormat);

const popupAtom = atom(false);
const productAtom = atom<any>({});
const uploadDialogAtom = atom(false);

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
      optical_power
      latitude
      longitude
      serial_number
      central_office
      attachment
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

const UPDATE_PRODUCT_BY_ID = gql`
  mutation UpdateProductById(
    $id: bigint!
    $latitude: String!
    $longitude: String!
    $productId: bigint!
    $productName: String!
    $opticalPower: String!
    $centralOffice: String!
    $capacity: bigint!
  ) {
    update_product_serials_by_pk(
      pk_columns: { id: $id }
      _set: {
        latitude: $latitude
        longitude: $longitude
        optical_power: $opticalPower
        central_office: $centralOffice
        capacity: $capacity
      }
    ) {
      id
      created_at
      updated_at
    }
    update_products_by_pk(
      pk_columns: { id: $productId }
      _set: { name: $productName }
    ) {
      id
      created_at
      updated_at
    }
  }
`;

const DELETE_PRODUCT_FROM_HARDWARE_INSTALLATION = gql`
  mutation DeleteProductFromHardwareInstallation($id: bigint!) {
    delete_hardware_installations_by_pk(id: $id) {
      id
      created_at
      updated_at
    }
  }
`;

const UPLOAD_PHOTO = gql`
  mutation UploadPhoto($id: bigint!, $attachment: String!) {
    update_product_serials_by_pk(
      pk_columns: { id: $id }
      _set: { attachment: $attachment }
    ) {
      id
      attachment
      created_at
      updated_at
    }
  }
`;

const ProductData: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useAtom(popupAtom);
  const [product, setProduct] = useAtom(productAtom);
  const [location, setLocation] = useState<NativeGeocoderResult | null>(null);
  const [updateProducById, { data, loading, error }] =
    useMutation(UPDATE_PRODUCT_BY_ID);

  useEffect(() => {
    (async () => {
      const latitude = product?.latitude;
      const longitude = product?.longitude;
      if (latitude && longitude) {
        const locationData = await getRealLocation(
          Number(latitude),
          Number(longitude)
        );
        setLocation(locationData);
      }
    })();
  }, []);

  const getLocation = async () => {
    const permissionStatus = await Geolocation.checkPermissions();
    let currentPosition;
    if (
      permissionStatus.location !== "granted" ||
      permissionStatus.coarseLocation !== "granted"
    ) {
      const granted = await Geolocation.requestPermissions();
      if (
        granted.location === "granted" ||
        granted.coarseLocation === "granted"
      ) {
        currentPosition = await Geolocation.getCurrentPosition();
      }
    } else {
      currentPosition = await Geolocation.getCurrentPosition();
    }

    console.log(
      "CURRENT POSITION >>>>>>> ",
      currentPosition?.coords?.latitude,
      currentPosition?.coords?.longitude
    );

    const latitude = currentPosition?.coords?.latitude;
    const longitude = currentPosition?.coords?.longitude;
    if (latitude && longitude) {
      const locationData = await getRealLocation(latitude, longitude);
      setLocation(locationData);
    }
  };

  const getRealLocation = async (latitude: number, longitude: number) => {
    const geocodingResult = await NativeGeocoder.reverseGeocode(
      latitude,
      longitude
    );

    return geocodingResult[0];
  };

  const updateProduct = async () => {
    console.log(product);

    await updateProducById({
      variables: {
        id: product?.id,
        latitude: String(location?.latitude),
        longitude: String(location?.longitude),
        productId: product?.product?.id,
        productName: product?.product?.name,
        opticalPower: product?.optical_power,
        centralOffice: product?.central_office,
        capacity: product?.capacity,
      },
    });

    setIsPopupOpen(false);
  };

  return (
    <Popup opened={isPopupOpen} onBackdropClick={() => setIsPopupOpen(false)}>
      <Navbar
        title="Update Data"
        right={
          <Link navbar onClick={() => setIsPopupOpen(false)}>
            Close
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
            value={
              location
                ? `${location?.locality}, ${location?.administrativeArea}, ${location?.countryName}`
                : ""
            }
          />
          <div className="mx-4 mt-2">
            <Button outline onClick={getLocation}>
              Get Location
            </Button>
          </div>
        </List>

        <BlockTitle>Port</BlockTitle>
        <List>
          <ListItem
            label
            title="8"
            media={
              <Radio
                value={8}
                checked={product?.capacity === 8}
                onChange={() =>
                  setProduct((prev: any) => {
                    return {
                      ...prev,
                      capacity: 8,
                    };
                  })
                }
              />
            }
          />
          <ListItem
            label
            title="16"
            media={
              <Radio
                value={16}
                checked={product?.capacity === 16}
                onChange={() =>
                  setProduct((prev: any) => {
                    return {
                      ...prev,
                      capacity: 16,
                    };
                  })
                }
              />
            }
          />
        </List>

        <List>
          <ListInput
            outline
            label="Product Name"
            type="text"
            placeholder="Product Name"
            value={product?.product?.name}
            onChange={(event) => {
              setProduct((prev: any) => {
                return {
                  ...prev,
                  product: {
                    ...prev?.product,
                    name: event.target.value,
                  },
                };
              });
            }}
          />
          <ListInput
            outline
            label="Central Office Name"
            type="text"
            placeholder="Central Office Name"
            value={product?.central_office}
            onChange={(event) => {
              setProduct((prev: any) => {
                return {
                  ...prev,
                  central_office: event.target.value,
                };
              });
            }}
          />
          <ListInput
            outline
            label="Power Signal"
            type="text"
            placeholder="Power Signal"
            value={product?.optical_power}
            onChange={(event) => {
              setProduct((prev: any) => {
                return {
                  ...prev,
                  optical_power: event.target.value,
                };
              });
            }}
          />
          <div className="mx-4 mt-2">
            <Button onClick={updateProduct} disabled={loading}>
              Save
            </Button>
          </div>
        </List>
      </IonContent>
    </Popup>
  );
};

const UploadPhoto: React.FC = () => {
  const [showUpload, setShowUpload] = useAtom(uploadDialogAtom);
  const product = useAtomValue(productAtom);
  const [photo, setPhoto] = useState("");
  const [uploadPhoto, { loading }] = useMutation(UPLOAD_PHOTO);

  useEffect(() => {
    setPhoto(product?.attachment);
  }, [product]);

  const takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    });

    const imageBase64 = image.base64String;
    if (imageBase64) {
      setPhoto(imageBase64);
      console.log("IMAGE PATH ====> ", imageBase64);

      await uploadPhoto({
        variables: {
          id: product?.id,
          attachment: imageBase64,
        },
      });
    }
  };

  return (
    <Popup opened={showUpload} onBackdropClick={() => setShowUpload(false)}>
      <Navbar
        title="Upload Photo"
        right={
          <Link navbar onClick={() => setShowUpload(false)}>
            Close
          </Link>
        }
      />
      <Block className="min-h-[calc(100vh-184px)]">
        {!photo ? (
          <div className="flex flex-col items-center justify-center border-2 p-4 mb-4 border-dashed rounded min-h-[calc(100vh-184px)]">
            <h1 className="font-bold text-md">No image was uploaded</h1>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-184px)]">
            <img src={`data:image/jpeg;base64,${photo}`} alt="Uploaded photo" />
          </div>
        )}
        <Button onClick={takePicture} disabled={loading}>
          Upload Photo
        </Button>
      </Block>
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
  const [product, setProduct] = useAtom(productAtom);
  const setShowUpload = useSetAtom(uploadDialogAtom);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [deletedProductId, setDeletedProductId] = useState("");
  const { loading: productDataLoading, data: productData } = useQuery(
    FIND_PRODUCT_BY_SERIAL_NUMBER,
    {
      variables: {
        serialNumber: match.params.serialNumber,
      },
      fetchPolicy: "no-cache",
    }
  );
  const [
    getHardwareInstallations,
    {
      loading: hardwareInstallationLoading,
      data: hardwareInstallationData,
      refetch,
    },
  ] = useLazyQuery(FIND_HARDWARE_INSTALLATIONS_BY_ID);

  const [deleteProductFromHardwareInstallation] = useMutation(
    DELETE_PRODUCT_FROM_HARDWARE_INSTALLATION
  );

  useEffect(() => {
    (async () => {
      if (productData) {
        const product = productData?.product_serials[0] || {};
        const hardwareInstallationId =
          product?.hardware_installation?.hardware_installation_id || "";

        if (product) {
          await getHardwareInstallations({
            variables: {
              serialNumber: match.params.serialNumber,
              hardwareInstallationId,
            },
            fetchPolicy: "no-cache",
          });

          setProduct(product);
        }
      }
    })();
  }, [productData]);

  const handleUpdateData = () => {
    setIsPopupOpen((prev) => !prev);
  };

  const handleCustomers = () => {
    router.push(
      `/customers/${product?.hardware_installation?.hardware_installation_id}`
    );
  };

  const handleAttachProduct = () => {
    const product = productData?.product_serials[0] || {};
    const hardwareInstallationId =
      product?.hardware_installation?.hardware_installation_id || "";

    router.push(`/${hardwareInstallationId}/${match.params.serialNumber}`);
  };

  const dismantleProduct = async () => {
    setShowDeleteDialog(false);

    await deleteProductFromHardwareInstallation({
      variables: {
        id: deletedProductId,
      },
    });

    const product = productData?.product_serials[0] || {};
    const hardwareInstallationId =
      product?.hardware_installation?.hardware_installation_id || "";

    await refetch({
      serialNumber: match.params.serialNumber,
      hardwareInstallationId,
    });
  };

  const handleShowUpload = () => {
    setShowUpload(true);
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar
        titleClassName="w-32"
        title={<img src={inventZoneLogo} alt="InventZone logo" />}
        centerTitle
        bgClassName="bg-white border-b"
        className="top-0 sticky"
        right={
          <Link
            className="text-red-500 font-bold text-sm"
            navbar
            onClick={() => console.log("LOGOUT!")}
          >
            Logout
          </Link>
        }
      />

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

        <div className="flex bg-white mx-4 gap-2 overflow-x-scroll md:overflow-auto border rounded border-slate-100 shadow-sm">
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
            onClick={handleShowUpload}
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
                      onClick={() => {
                        setShowDeleteDialog(true);
                        setDeletedProductId(hw?.id);
                      }}
                      dividers
                      header={
                        dayjs(hw?.product_serial?.installed_at).format("LL") ||
                        ""
                      }
                      title={hw?.product_serial?.product?.name || ""}
                      footer={hw?.product_serial?.serial_number || ""}
                      titleWrapClassName="font-bold"
                    />
                  );
                }
              )}
            </List>
          </>
        )}
      </IonContent>

      <ProductData />

      <Dialog
        opened={showDeleteDialog}
        onBackdropClick={() => setShowDeleteDialog(false)}
        title="Dismatle Product"
        content="Are you sure you want to dismatle this product?"
        buttons={
          <>
            <DialogButton onClick={() => setShowDeleteDialog(false)}>
              No
            </DialogButton>
            <DialogButton strong onClick={dismantleProduct}>
              Yes
            </DialogButton>
          </>
        }
      />

      <UploadPhoto />
    </div>
  );
};

export default Dashboard;
