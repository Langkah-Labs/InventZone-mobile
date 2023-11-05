import {
  Navbar,
  List,
  ListItem,
  Dialog,
  DialogButton,
  Link,
  Fab,
  Popup,
  BlockTitle,
  ListInput,
  Button,
} from "konsta/react";
import { IonContent, IonIcon, useIonRouter } from "@ionic/react";
import { chevronBackOutline, addOutline } from "ionicons/icons";
import { atom, useAtom, useSetAtom } from "jotai";

const dialogAtom = atom(false);
const modalSheetAtom = atom(false);

const CustomerData: React.FC = () => {
  const [openModalSheet, setOpenModalSheet] = useAtom(modalSheetAtom);

  return (
    <Popup
      opened={openModalSheet}
      onBackdropClick={() => setOpenModalSheet(false)}
    >
      <Navbar
        title="Add Customer"
        right={
          <Link navbar onClick={() => setOpenModalSheet(false)}>
            Save
          </Link>
        }
      />
      <IonContent>
        <List>
          <ListInput
            outline
            label="ID Pelanggan"
            type="text"
            placeholder="ID Pelanggan"
          />
          <ListInput
            outline
            label="Alamat"
            type="textarea"
            placeholder="Alamat"
            inputClassName="!h-20 resize-none"
          />
          <ListInput
            outline
            label="Layanan"
            type="text"
            placeholder="Layanan"
          />
          <ListInput
            outline
            label="Power Signal"
            type="text"
            placeholder="Power Signal"
          />
          <ListInput
            outline
            label="S/N Modem"
            type="text"
            placeholder="S/N Modem"
          />

          <ListInput
            outline
            label="Port"
            type="select"
            dropdown
            defaultValue="1"
          >
            <option value="1">Port 1</option>
            <option value="2">Port 2</option>
          </ListInput>
        </List>
      </IonContent>
    </Popup>
  );
};

const Customers: React.FC = () => {
  const [openDialog, setOpenDialog] = useAtom(dialogAtom);
  const setOpenModalSheet = useSetAtom(modalSheetAtom);
  const router = useIonRouter();

  const goBack = () => {
    router.goBack();
  };

  const openAddCustomerDialog = () => {
    setOpenModalSheet((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar
        title="Customer Data"
        className="top-0 sticky"
        left={
          <Link className="p-4 flex items-center gap-1" onClick={goBack}>
            <IonIcon icon={chevronBackOutline} size="small"></IonIcon>
          </Link>
        }
      />

      <IonContent>
        <List dividers margin="my-2">
          <ListItem
            onClick={() => setOpenDialog(true)}
            link
            chevronMaterial={false}
            after="Dec 02, 2020"
            header="Port 1"
            title="Customer 1"
            subtitle="Address 1"
            text="Service 1"
          />
          <ListItem
            onClick={() => setOpenDialog(true)}
            link
            chevronMaterial={false}
            after="Dec 02, 2020"
            header="Port 2"
            title="Customer 2"
            subtitle="Address 2"
            text="Service 2"
          />
        </List>

        <Fab
          className="fixed right-4-safe bottom-4-safe z-20"
          icon={<IonIcon icon={addOutline} />}
          onClick={openAddCustomerDialog}
        />
      </IonContent>

      <Dialog
        opened={openDialog}
        onBackdropClick={() => setOpenDialog(false)}
        title="Dismantle Customer"
        content="Are you sure to dismantle the customer?"
        buttons={
          <>
            <DialogButton onClick={() => setOpenDialog(false)}>
              Yes
            </DialogButton>
            <DialogButton strong onClick={() => setOpenDialog(false)}>
              No
            </DialogButton>
          </>
        }
      />

      <CustomerData />
    </div>
  );
};

export default Customers;
