import {
  Block,
  List,
  ListInput,
  Link,
  Button,
  Navbar,
  Toast,
} from "konsta/react";
import { IonContent, useIonRouter, IonIcon } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { signUp } from "supertokens-web-js/recipe/emailpassword";

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

const CREATE_NEW_USER = gql`
  mutation MyMutation(
    $company: String!
    $name: String!
    $username: String!
    $email: String!
    $phone: String!
    $role: String!
  ) {
    insert_users_one(
      object: {
        company: $company
        name: $name
        username: $username
        email: $email
        phone: $phone
        role: $role
      }
    ) {
      id
      name
      phone
      role
      username
      company
      email
      created_at
      updated_at
    }
  }
`;

const Register: React.FC = () => {
  const router = useIonRouter();
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    phone: "",
    role: "project",
  });
  const [toast, setToast] = useState({
    open: false,
    message: "",
  });
  const [findUserByEmail] = useLazyQuery(FIND_USER_BY_EMAIL);
  const [createNewUser] = useMutation(CREATE_NEW_USER);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
        message: "",
      }));
    }, 2000);

    return () => {
      clearTimeout(id);
    };
  }, [toast.open]);

  const handleInput = (event: any) => {
    event.preventDefault();

    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const register = async () => {
    setIsLoading(true);

    if (!formData.email) {
      setToast((prev) => ({
        ...prev,
        open: true,
        message: `The email field is required.`,
      }));

      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.passwordConfirmation) {
      setToast((prev) => ({
        ...prev,
        open: true,
        message: `Your password and its confirmation doesn't match.`,
      }));

      setIsLoading(false);
      return;
    }

    const response = await findUserByEmail({
      variables: {
        email: formData.email,
      },
    });

    const data = response.data;

    if (data?.users?.length > 1) {
      setToast((prev) => ({
        ...prev,
        open: true,
        message: `User with email ${formData.email} is already exists! please choose the other ones`,
      }));

      setIsLoading(false);
      return;
    }

    try {
      let response = await signUp({
        formFields: [
          {
            id: "email",
            value: formData.email,
          },
          {
            id: "password",
            value: formData.password,
          },
          {
            id: "company",
            value: formData.company,
          },
          {
            id: "name",
            value: formData.name,
          },
          {
            id: "username",
            value: formData.username,
          },
          {
            id: "phone",
            value: formData.phone,
          },
        ],
      });

      if (response.status === "FIELD_ERROR") {
        // one of the input formFields failed validaiton
        response.formFields.forEach((formField: any) => {
          if (formField.id === "email") {
            setToast((prev) => ({
              ...prev,
              open: true,
              message: formField.error,
            }));
          } else if (formField.id === "password") {
            setToast((prev) => ({
              ...prev,
              open: true,
              message: formField.error,
            }));
          }
        });
      } else if (response.status === "SIGN_UP_NOT_ALLOWED") {
        setToast((prev) => ({
          ...prev,
          open: true,
          message: "Failed to registering a user, please try again later!",
        }));
      } else {
        const response = await createNewUser({
          variables: {
            company: formData.company,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          },
        });

        if (response.errors && response.errors?.length > 0) {
          console.error(`REGISTER ERROR : ${JSON.stringify(response.errors)}`);

          setToast((prev) => ({
            ...prev,
            open: true,
            message: "Failed to registering a user, please try again later!",
          }));

          setIsLoading(false);
          return;
        }

        router.push("/scanners", "forward", "replace");
      }
    } catch (err: any) {
      console.error(err);

      setToast((prev) => ({
        ...prev,
        open: true,
        message: "Failed to registering a user, please try again later!",
      }));
    }

    setIsLoading(false);
  };

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
            onChange={handleInput}
          />
          <ListInput
            name="name"
            outline
            label="Full Name"
            type="text"
            placeholder="Full Name"
            onChange={handleInput}
          />
          <ListInput
            name="username"
            outline
            label="Username"
            type="text"
            placeholder="Username"
            onChange={handleInput}
          />
          <ListInput
            name="email"
            outline
            label="Email"
            type="text"
            placeholder="Email"
            onChange={handleInput}
          />
          <ListInput
            name="password"
            outline
            label="Password"
            type="password"
            placeholder="Password"
            onChange={handleInput}
          />
          <ListInput
            name="passwordConfirmation"
            outline
            label="Confirm Password"
            type="password"
            placeholder="Confirm Password"
            onChange={handleInput}
          />
          <ListInput
            name="phone"
            outline
            label="Phone Number"
            type="number"
            placeholder="Phone Number"
            onChange={handleInput}
          />
          <ListInput
            name="role"
            outline
            label="Role"
            type="select"
            dropdown
            onChange={handleInput}
          >
            <option value="project">Project</option>
            <option value="installation">Installation</option>
          </ListInput>

          <Block>
            <Button onClick={register} color="#167AFF" disabled={isLoading}>
              Sign In
            </Button>
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

export default Register;
