import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@mantine/core/styles.css";
import "react-toastify/dist/ReactToastify.css";

// import "@mantine/core/lib/styles/global.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider forceColorScheme="dark">
      <App />
    </MantineProvider>
  </StrictMode>
);
