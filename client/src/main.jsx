import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SocketProvider } from "./hooks/use-socket.jsx";
import { MediasoupProvider } from "./hooks/use-mediasoup.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <MediasoupProvider>
        <App />
      </MediasoupProvider>
    </SocketProvider>
  </StrictMode>
);
