// import { Link } from "konsta/react";
import { IonIcon, useIonRouter } from "@ionic/react";
import { Link, RouteComponentProps } from "react-router-dom";
import { hardwareChipOutline, qrCodeOutline } from "ionicons/icons";
import logo from "../../resources/logo.png";

const menus = [
  {
    id: "nfc",
    href: "/scanners/nfc",
    title: "NFC",
    icon: hardwareChipOutline,
  },
  {
    id: "barcode",
    href: "/scanners/barcode",
    title: "QR Code or Barcode",
    icon: qrCodeOutline,
  },
];

interface ScannerMenuProps
  extends RouteComponentProps<{
    hardwareInstallationId?: string;
    serialNumber?: string;
  }> {}

const ScannerMenu: React.FC<ScannerMenuProps> = ({ match }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-8">
      <div className="flex gap-2 flex-col justify-center items-center mb-8">
        <img className="w-3/5" src={logo} alt="InventZone" />
        <h1 className="text-slate-500 text-sm text-center">
          To get started, please choose the scanning methods
        </h1>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {menus.map(({ id, title, href, icon }) => {
          return (
            <Link
              key={id}
              className="flex flex-col justify-center items-center gap-2 border border-[#167AFF] rounded p-4 text-[#167AFF] hover:bg-[#167AFF] hover:text-white w-full"
              to={`${
                match.params.hardwareInstallationId && match.params.serialNumber
                  ? `${href}/${match.params.hardwareInstallationId}/${match.params.serialNumber}`
                  : href
              }`}
            >
              <IonIcon icon={icon} size="large"></IonIcon>
              {title}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ScannerMenu;
