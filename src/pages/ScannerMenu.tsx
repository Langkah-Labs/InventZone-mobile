// import { Link } from "konsta/react";
import { IonIcon } from "@ionic/react";
import { Link } from "react-router-dom";
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

const ScannerMenu: React.FC = () => {
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
              to={href}
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
