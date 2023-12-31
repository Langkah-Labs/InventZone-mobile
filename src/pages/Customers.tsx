import {
  Navbar,
  List,
  ListItem,
  Dialog,
  DialogButton,
  Link,
  Fab,
  Popup,
  ListInput,
  Preloader,
  Block,
} from "konsta/react";
import { IonContent, IonIcon, useIonRouter } from "@ionic/react";
import { chevronBackOutline, addOutline } from "ionicons/icons";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { RouteComponentProps } from "react-router";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useEffect, useState } from "react";

dayjs.extend(LocalizedFormat);

const FIND_CUSTOMERS_BY_HARDWARE_INSTALLATION_ID = gql`
  query FindCustomersByHardwareInstallationId(
    $hardwareInstallationId: String!
  ) {
    customers(
      where: { hardware_installation_id: { _eq: $hardwareInstallationId } }
    ) {
      id
      port
      customer_id
      address
      service
      created_at
      updated_at
    }
  }
`;

const INSERT_NEW_CUSTOMER = gql`
  mutation InsertNewCustomer(
    $customerId: String!
    $address: String!
    $service: String!
    $powerSignal: String!
    $modemSerialNumber: String!
    $port: String!
    $hardwareInstallationId: String!
  ) {
    insert_customers_one(
      object: {
        customer_id: $customerId
        address: $address
        service: $service
        power_signal: $powerSignal
        modem_serial_number: $modemSerialNumber
        port: $port
        hardware_installation_id: $hardwareInstallationId
      }
    ) {
      id
      created_at
      updated_at
    }
  }
`;

const REMOVE_CUSTOMER_BY_ID = gql`
  mutation RemoveCustomerById($id: bigint!) {
    delete_customers_by_pk(id: $id) {
      id
      created_at
      updated_at
    }
  }
`;

const FIND_HARDWARE_INSTALLATIONS_BY_ID = gql`
  query FindHardwareInstallationById($hardwareInstallationId: String!) {
    hardware_installations(
      where: { hardware_installation_id: { _eq: $hardwareInstallationId } }
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
        capacity
        capacity_remaining
      }
    }
  }
`;

const dialogAtom = atom(false);
const modalSheetAtom = atom(false);

const CustomerData: React.FC<any> = ({
  hardwareInstallationId,
  submitCallback,
}) => {
  const [openModalSheet, setOpenModalSheet] = useAtom(modalSheetAtom);
  const [formData, setFormData] = useState({
    customerId: "",
    address: "",
    service: "",
    powerSignal: "",
    modemSerialNumber: "",
    port: "1",
    hardwareInstallationId: "",
  });
  const [createCustomer, { loading }] = useMutation(INSERT_NEW_CUSTOMER);
  const [findHardwareInstallation] = useLazyQuery(
    FIND_HARDWARE_INSTALLATIONS_BY_ID
  );
  const [findCustomersByHardwareInstallationId] = useLazyQuery(
    FIND_CUSTOMERS_BY_HARDWARE_INSTALLATION_ID
  );
  const [ports, setPorts] = useState<number[]>([]);

  const handleChange = (event: any) => {
    event.preventDefault();
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const createNewCustomer = async () => {
    await createCustomer({
      variables: {
        ...formData,
        hardwareInstallationId,
      },
    });

    setOpenModalSheet(false);
    submitCallback();
  };

  const availablePorts = async () => {
    const response = await findHardwareInstallation({
      variables: {
        hardwareInstallationId,
      },
    });

    const data = response.data;
    if (data.hardware_installations?.length > 0) {
      let portCapacity = 0;

      const hardwareInstallations = data.hardware_installations;
      for (let i = 0; i < hardwareInstallations.length; i++) {
        const hardware = hardwareInstallations[i];
        if (
          hardware?.product_serial?.capacity ||
          hardware?.product_serial?.capacity !== 0
        ) {
          portCapacity = hardware?.product_serial?.capacity;
          break;
        }
      }

      const response = await findCustomersByHardwareInstallationId({
        variables: {
          hardwareInstallationId: hardwareInstallationId,
        },
      });

      const customerPorts = response?.data?.customers?.map((customer: any) =>
        parseInt(customer?.port, 10)
      );
      let availablePorts = [];
      for (let i = 0; i < portCapacity; i++) {
        const portNumber = i + 1;
        if (!customerPorts?.includes(portNumber)) {
          availablePorts.push(portNumber);
        }
      }

      setPorts(availablePorts);
    }
  };

  useEffect(() => {
    (async () => {
      await availablePorts();
    })();
  }, []);

  return (
    <Popup
      opened={openModalSheet}
      onBackdropClick={() => setOpenModalSheet(false)}
    >
      <Navbar
        title="Add Customer"
        right={
          loading ? (
            <Preloader />
          ) : (
            <Link navbar onClick={createNewCustomer}>
              Save
            </Link>
          )
        }
      />
      <IonContent>
        <List>
          <ListInput
            name="customerId"
            outline
            label="ID Pelanggan"
            type="text"
            placeholder="ID Pelanggan"
            onChange={handleChange}
          />
          <ListInput
            name="address"
            outline
            label="Alamat"
            type="textarea"
            placeholder="Alamat"
            inputClassName="!h-20 resize-none"
            onChange={handleChange}
          />
          <ListInput
            name="service"
            outline
            label="Layanan"
            type="text"
            placeholder="Layanan"
            onChange={handleChange}
          />
          <ListInput
            name="powerSignal"
            outline
            label="Power Signal"
            type="text"
            placeholder="Power Signal"
            onChange={handleChange}
          />
          <ListInput
            name="modemSerialNumber"
            outline
            label="S/N Modem"
            type="text"
            placeholder="S/N Modem"
            onChange={handleChange}
          />

          <ListInput
            name="port"
            outline
            label="Port"
            type="select"
            dropdown
            value={formData.port}
            onChange={handleChange}
          >
            {ports?.map((port) => {
              return (
                <option key={port} value={`${port}`}>
                  Port {port}
                </option>
              );
            })}
          </ListInput>
        </List>
      </IonContent>
    </Popup>
  );
};

interface CustomersPageProps
  extends RouteComponentProps<{
    hardwareInstallationId: string;
  }> {}

const Customers: React.FC<CustomersPageProps> = ({ match }) => {
  const [openDialog, setOpenDialog] = useAtom(dialogAtom);
  const setOpenModalSheet = useSetAtom(modalSheetAtom);
  const router = useIonRouter();
  const { loading, data, refetch } = useQuery(
    FIND_CUSTOMERS_BY_HARDWARE_INSTALLATION_ID,
    {
      variables: {
        hardwareInstallationId: match.params.hardwareInstallationId,
      },
    }
  );
  const [removeCustomerById] = useMutation(REMOVE_CUSTOMER_BY_ID);
  const [customerId, setCustomerId] = useState("");

  const goBack = () => {
    router.goBack();
  };

  const openAddCustomerDialog = () => {
    setOpenModalSheet((prev) => !prev);
  };

  const dismatleCustomer = async () => {
    setOpenDialog(false);
    await removeCustomerById({
      variables: {
        id: customerId,
      },
    });
    setCustomerId("");
    refetchCustomers();
  };

  const refetchCustomers = () => {
    refetch({
      variables: {
        hardwareInstallationId: match.params.hardwareInstallationId,
      },
    });
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
        {loading ? (
          <Block className="text-center">
            <Preloader />
          </Block>
        ) : (
          <>
            {data?.customers?.length === 0 ? (
              <Block className="flex justify-center items-center mt-8">
                <h1 className="font-bold text-slate-500">
                  There are no customers added yet!
                </h1>
              </Block>
            ) : (
              <List dividers margin="my-2">
                {data?.customers?.map((customer: any) => {
                  return (
                    <ListItem
                      key={customer?.id}
                      onClick={() => {
                        setCustomerId(customer?.id);
                        setOpenDialog(true);
                      }}
                      link
                      chevronMaterial={false}
                      after={dayjs(customer?.created_at).format("LL") || ""}
                      header={`Port ${customer?.port}`}
                      title={customer?.customer_id}
                      subtitle={customer?.address}
                      text={customer?.service}
                    />
                  );
                })}
              </List>
            )}

            <Fab
              className="fixed right-4-safe bottom-4-safe z-20"
              icon={<IonIcon icon={addOutline} />}
              onClick={openAddCustomerDialog}
            />
          </>
        )}
      </IonContent>

      <Dialog
        opened={openDialog}
        onBackdropClick={() => setOpenDialog(false)}
        title="Dismantle Customer"
        content="Are you sure to dismantle the customer?"
        buttons={
          <>
            <DialogButton onClick={dismatleCustomer}>Yes</DialogButton>
            <DialogButton strong onClick={() => setOpenDialog(false)}>
              No
            </DialogButton>
          </>
        }
      />

      <CustomerData
        hardwareInstallationId={match.params.hardwareInstallationId}
        submitCallback={refetchCustomers}
      />
    </div>
  );
};

export default Customers;
