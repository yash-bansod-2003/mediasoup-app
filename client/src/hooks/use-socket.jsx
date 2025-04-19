import * as React from "react";
import { io } from "socket.io-client";

const SocketContext = React.createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = React.useMemo(() => io("http://localhost:5000"), []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = React.useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};
