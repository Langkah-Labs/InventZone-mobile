import { Block, List, ListInput, Link, Button, Toast } from "konsta/react";
import { IonPage, IonContent, useIonRouter } from "@ionic/react";
import { gql, useLazyQuery } from "@apollo/client";
import { useState } from "react";
import { signIn } from "supertokens-web-js/recipe/emailpassword";
import { Browser } from "@capacitor/browser";

const FIND_USER_BY_EMAIL = gql`
  query FindUserByEmail($email: String!) {
    users(
      where: {
        email: { _eq: $email }
        role: { _in: ["project", "installation"] }
      }
      limit: 1
    ) {
      id
      name
      email
      phone
      role
      serial_numbers_remaining
      reference
      company
      username
      created_at
      updated_at
    }
  }
`;

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useIonRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [findUserByEmail] = useLazyQuery(FIND_USER_BY_EMAIL);
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [toast, setToast] = useState({
    open: false,
    message: "",
  });

  const handleForgetPassword = async () => {
    await Browser.open({
      url: "http://191.96.57.242:8085/users/forgot-password",
    });
  };

  const redirectToRegister = () => {
    router.push("/register");
  };

  const handleInput = (event: any) => {
    event.preventDefault();

    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const performLogin = async () => {
    setIsLoading(true);

    const response = await findUserByEmail({
      variables: {
        email: formData.email,
      },
    });

    const data = response.data;

    if (data?.users?.length < 1) {
      setToast((prev) => ({
        ...prev,
        open: true,
        message: `User with email ${formData.email} not found! Please try again.`,
      }));

      setIsLoading(false);
      return;
    }

    try {
      let response = await signIn({
        formFields: [
          {
            id: "email",
            value: formData.email,
          },
          {
            id: "password",
            value: formData.password,
          },
        ],
      });

      if (response.status === "FIELD_ERROR") {
        // one of the input formFields failed validaiton
        setToast((prev) => ({
          ...prev,
          open: true,
          message: "Failed to login, please check your credentials!",
        }));
      } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
        setToast((prev) => ({
          ...prev,
          open: true,
          message: "Failed to login, please check your credentials!",
        }));
      } else {
        router.push("/scanners", "forward", "replace");
      }
    } catch (err) {
      console.error(err);

      setToast((prev) => ({
        ...prev,
        open: true,
        message: "Oops! something wrong happened, please try again later.",
      }));
    }

    setIsLoading(false);
  };

  return (
    <IonContent>
      <div className="flex flex-col p-4 justify-center min-h-screen">
        <div className="flex flex-col gap-1 mx-4">
          <h1 className="font-bold text-[#167AFF] text-3xl">Hello,</h1>
          <h2 className="font-semibold text-gray-700 text-xl">
            Let's introduce
          </h2>
        </div>

        <List>
          <ListInput
            name="email"
            outline
            type="text"
            placeholder="Username"
            onChange={handleInput}
          />
          <ListInput
            name="password"
            outline
            type="password"
            placeholder="Password"
            onChange={handleInput}
          />
          <Link
            onClick={handleForgetPassword}
            className="m-4 float-right font-semibold text-sm text-[#167AFF]"
          >
            Forget password?
          </Link>

          <div className="mx-4">
            <Button color="#167AFF" disabled={isLoading} onClick={performLogin}>
              Sign In
            </Button>
          </div>

          <Block className="flex justify-center gap-2">
            <p className="text-gray-500">Don't have an account?</p>
            <Link onClick={redirectToRegister} className="font-bold">
              Sign Up
            </Link>
          </Block>
        </List>
      </div>

      <Toast
        position="center"
        opened={toast.open}
        button={
          <Button
            rounded
            clear
            small
            inline
            onClick={() =>
              setToast((prev) => ({
                ...prev,
                open: false,
              }))
            }
          >
            Close
          </Button>
        }
      >
        <div className="shrink">{toast.message}</div>
      </Toast>
    </IonContent>
  );
};

export default Login;
