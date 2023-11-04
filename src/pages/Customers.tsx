import { Navbar, List, ListItem, Dialog, DialogButton } from "konsta/react";
import { IonContent, IonIcon } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { Link } from "react-router-dom";
import { atom, useAtom } from "jotai";

const dialogAtom = atom(false);

const Customers: React.FC = () => {
  const [openDialog, setOpenDialog] = useAtom(dialogAtom);

  return (
    <div className="flex flex-col h-full">
      <Navbar
        title="Customer Data"
        className="top-0 sticky"
        left={
          <Link className="p-4 flex items-center gap-1" to="/dashboard">
            <IonIcon icon={chevronBackOutline} size="small"></IonIcon>
          </Link>
        }
      />

      <IonContent>
        <List dividers className="my-2">
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
    </div>
  );
};

export default Customers;
