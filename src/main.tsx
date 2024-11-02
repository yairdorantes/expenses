// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@mantine/core/styles.css";
import "react-toastify/dist/ReactToastify.css";

// import "@mantine/core/lib/styles/global.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <MantineProvider forceColorScheme="dark">
      <App />
    </MantineProvider>
  </BrowserRouter>
);
