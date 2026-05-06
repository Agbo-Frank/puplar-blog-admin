import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { SWRProvider } from "@/providers/swr-provider";
import { StoreProvider } from "@/hooks/use-store";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SWRProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </SWRProvider>
    </BrowserRouter>
  </StrictMode>
);
