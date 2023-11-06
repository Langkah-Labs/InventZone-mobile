import React from "react";
import { createRoot } from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import App from "./App";
import "./tailwind.css";
import "./config/supertokens";

const client = new ApolloClient({
  uri: "http://191.96.57.242:8080/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "InventZone_2023",
  },
  cache: new InMemoryCache(),
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
