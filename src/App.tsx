import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import { KonstaProvider } from "konsta/react";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

import ScannerMenu from "./pages/ScannerMenu";
import BarcodeScanner from "./pages/BarcodeScanner";
import NfcScanner from "./pages/NfcScanner";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";

setupIonicReact();

const App: React.FC = () => {
  return (
    <KonstaProvider theme="parent">
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/" exact={true} component={ScannerMenu} />
            <Route
              path="/:hardwareInstallationId/:serialNumber"
              exact={true}
              component={ScannerMenu}
            />
            <Route
              path="/scanners/barcode"
              exact={true}
              component={BarcodeScanner}
            />
            <Route
              path="/scanners/barcode/:hardwareInstallationid/:serialNumber"
              exact={true}
              component={BarcodeScanner}
            />
            <Route path="/scanners/nfc" exact={true} component={NfcScanner} />
            <Route
              path="/scanners/nfc/:hardwareInstallationId/:serialNumber"
              exact={true}
              component={NfcScanner}
            />
            <Route path="/dashboard/:serialNumber" component={Dashboard} />
            <Route
              path="/customers/:hardwareInstallationId"
              component={Customers}
            />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </KonstaProvider>
  );
};

export default App;
