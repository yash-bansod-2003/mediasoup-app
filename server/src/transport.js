import { configuration } from "./configuration.js";

export const createWebRtcTransport = async (router) => {
  const transport = await router.createWebRtcTransport(
    {
      listenInfos: configuration.transportOptions.listenInfos,
      enableUdp: true,
      enableTcp: false
    });
  return transport;
}