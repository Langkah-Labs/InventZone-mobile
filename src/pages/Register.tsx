import { Block, List, ListInput, Link, Button, Navbar } from "konsta/react";
import { IonContent, useIonRouter, IonIcon } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";

const Register: React.FC = () => {
  const router = useIonRouter();

  const backToLogin = () => {
    router.push("/");
  };

  return (
    <IonContent>
      <Navbar
        transparent={true}
        className="top-0 sticky"
        left={
          <Link className="p-4 flex items-center gap-1" onClick={backToLogin}>
            <IonIcon icon={chevronBackOutline} size="small"></IonIcon>
            <p className="font-medium">Back</p>
          </Link>
        }
      />
      <div className="flex flex-col p-4">
        <div className="flex flex-col gap-1 mx-4">
          <h1 className="font-bold text-[#167AFF] text-3xl">Sign Up</h1>
          <h2 className="text-gray-500">
            Register yourself to continue using the app
          </h2>
        </div>

        <List>
          <ListInput
            name="company"
            outline
            label="Company Name"
            type="text"
            placeholder="Company Name"
          />
          <ListInput
            name="name"
            outline
            label="Full Name"
            type="text"
            placeholder="Full Name"
          />
          <ListInput
            name="username"
            outline
            label="Username"
            type="text"
            placeholder="Username"
          />
          <ListInput
            name="email"
            outline
            label="Email"
            type="text"
            placeholder="Email"
          />
          <ListInput
            name="password"
            outline
            label="Password"
            type="password"
            placeholder="Password"
          />
          <ListInput
            name="passwordConfirmation"
            outline
            label="Confirm Password"
            type="password"
            placeholder="Confirm Password"
          />
          <ListInput
            name="phone"
            outline
            label="Phone Number"
            type="number"
            placeholder="Phone Number"
          />
          <ListInput name="role" outline label="Role" type="select" dropdown>
            <option value="project">Project</option>
            <option value="installation">Installation</option>
          </ListInput>

          <Block>
            <Button color="#167AFF" disabled>
              Sign In
            </Button>
          </Block>
        </List>
      </div>
    </IonContent>
  );
};

export default Register;
