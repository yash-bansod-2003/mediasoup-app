import * as React from "react";
import * as mediasoupClient from "mediasoup-client";

const MediasoupContext = React.createContext(null);

export const MediasoupProvider = ({ children }) => {
  const [device, setDevice] = React.useState(null);

  const loadDevices = React.useCallback(async (rtpCapabilities) => {
    const device = await new mediasoupClient.Device();
    console.log(device);

    await device.load(rtpCapabilities);
    setDevice(device);
  }, []);

  const getUserMedia = React.useCallback(async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    return stream;
  }, []);

  return (
    <MediasoupContext.Provider value={{ loadDevices, getUserMedia, device }}>
      {children}
    </MediasoupContext.Provider>
  );
};

export const useMediasoup = () => {
  const Mediasoup = React.useContext(MediasoupContext);
  if (!Mediasoup) {
    throw new Error("useMediasoup must be used within a MediasoupProvider");
  }
  return Mediasoup;
};
