import React from "react";
import ReactDOM from "react-dom/client";  // Use 'react-dom/client' for React 18+
import { WalletProvider, SuiTestnetChain } from "@suiet/wallet-kit";
import App from "./App";

const rootElement = document.getElementById("root");

// Create a root with 'createRoot' method
const root = ReactDOM.createRoot(rootElement);

// Use 'root.render' instead of 'ReactDOM.render'
root.render(
  <WalletProvider>
    <App />
  </WalletProvider>
);
