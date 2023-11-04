import {
  Navbar,
  Button,
  List,
  ListItem,
  BlockTitle,
  Popup,
  Block,
  Page,
  Link,
  ListInput,
  Radio,
} from "konsta/react";
import { IonContent, IonIcon, IonInput, IonList, IonItem } from "@ionic/react";
import {
  hammerOutline,
  personAddOutline,
  documentOutline,
  cameraOutline,
  qrCodeOutline,
} from "ionicons/icons";
import { atom, useAtom } from "jotai";

const popupAtom = atom(false);
const radioGroupAtom = atom("");

const CustomerData: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useAtom(popupAtom);

  const [groupValue, setGroupValue] = useAtom(radioGroupAtom);

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

const Dashboard: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useAtom(popupAtom);

  const handleUpdateData = () => {
    setIsPopupOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Invent Zone" centerTitle className="top-0 sticky" />

      <IonContent>
        <div className="flex flex-col rounded bg-white border border-slate-100 shadow-sm p-4 m-4">
          <h1 className="text-black font-bold text-lg">ODP - CA</h1>
          <p className="text-slate-500 text-md">02 February 2023</p>
        </div>

        <div className="flex mx-4 gap-2 overflow-x-scroll md:overflow-auto">
          <Button
            outline
            large
            className="flex flex-col w-28 h-28 justify-center items-center gap-2 p-4 rounded text-xs font-medium text-center"
          >
            <IonIcon icon={hammerOutline} className="w-6 h-6"></IonIcon>
            Attach Product
          </Button>

          <Button
            outline
            large
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

        <BlockTitle>Linked Products</BlockTitle>
        <List dividersMaterial>
          <ListItem
            link
            header="02 Feb 2023"
            title="FAT"
            footer="70B3D51A0"
            titleWrapClassName="font-bold"
            chevronIcon={
              <IonIcon icon={qrCodeOutline} className="h-6 w-6"></IonIcon>
            }
          />
        </List>
      </IonContent>

      <CustomerData />
    </div>
  );
};

export default Dashboard;
