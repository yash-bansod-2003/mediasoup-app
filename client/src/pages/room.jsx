import * as React from "react";
import { useSocket } from "../hooks/use-socket.jsx";
import { useMediasoup } from "../hooks/use-mediasoup.jsx";

function Room() {
  const { socket } = useSocket();
  const { loadDevices, getUserMedia, device } = useMediasoup();

  const createWebRtcTransport = React.useCallback(
    async (rtpCapabilities) => {
      console.log(
        "[createWebRtcTransport] Called with rtpCapabilities:",
        rtpCapabilities
      );
      socket.emit("createWebRtcTransportProducer", {
        rtpCapabilities,
        forceTcp: false,
      });
    },
    [socket]
  );

  const handleSupportedRtpCapabilities = React.useCallback(
    async (rtpCapabilities) => {
      console.log(
        "[handleSupportedRtpCapabilities] Received capabilities:",
        rtpCapabilities
      );
      try {
        await loadDevices(rtpCapabilities);
        console.log(
          "[handleSupportedRtpCapabilities] Devices loaded successfully."
        );
        await createWebRtcTransport(rtpCapabilities);
        console.log(
          "[handleSupportedRtpCapabilities] WebRTC transport creation initiated."
        );
      } catch (error) {
        console.error(
          "[handleSupportedRtpCapabilities] Error during RTP capabilities handling:",
          error
        );
      }
    },
    [createWebRtcTransport, loadDevices]
  );

  const handleCreatedWebRtcTransportProducer = React.useCallback(
    async (data) => {
      console.log(
        "[handleCreatedWebRtcTransportProducer] Data received:",
        data
      );
      try {
        const { id, iceParameters, iceCandidates, dtlsParameters } = data;
        const transport = device.createSendTransport({
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
        });
        console.log(
          "[handleCreatedWebRtcTransportProducer] Transport created with id:",
          id
        );

        transport.on("connect", async ({ dtlsParameters }, callback) => {
          console.log(
            "[transport.connect] Called with dtlsParameters:",
            dtlsParameters
          );
          socket.emit("connectWebRtcTransportProducer", {
            dtlsParameters,
            transportId: id,
          });
          socket.on("connectedWebRtcTransportProducer", () => {
            console.log(
              "[transport.connect] Connected WebRTC Transport Producer confirmed by server."
            );
            callback();
          });
        });

        transport.on("produce", async (parameters, callback, errback) => {
          console.log(
            "[transport.produce] Called with parameters:",
            parameters
          );
          socket.emit(
            "produceWebRtcTransportProducer",
            {
              transportId: id,
              kind: parameters.kind,
              rtpParameters: parameters.rtpParameters,
            },
            (error, { id: producerId } = {}) => {
              if (error) {
                console.error("[transport.produce] Error from server:", error);
                errback(error);
              } else {
                console.log(
                  "[transport.produce] Producer created with id:",
                  producerId
                );
                callback({ id: producerId });
              }
            }
          );
        });

        transport.on("connectionstatechange", (state) => {
          console.log(
            "[transport.connectionstatechange] State changed to:",
            state
          );
          if (state === "connected") {
            console.log(
              "[transport.connectionstatechange] Transport connected"
            );
          } else if (state === "failed") {
            console.error(
              "[transport.connectionstatechange] Transport failed. Closing transport."
            );
            transport.close();
          }
        });

        transport.on("close", () => {
          console.log("[transport.close] Transport closed");
        });

        const stream = await getUserMedia();
        console.log(
          "[handleCreatedWebRtcTransportProducer] Obtained user media stream:",
          stream
        );
        const track = stream.getVideoTracks()[0];
        if (!track) {
          console.warn(
            "[handleCreatedWebRtcTransportProducer] No video track found in stream"
          );
          return;
        }
        const params = {
          track,
          encodings: [
            { maxBitrate: 1000000 },
            { maxBitrate: 500000 },
            { maxBitrate: 100000 },
          ],
          codecOptions: {
            videoGoogleStartBitrate: 1000,
          },
        };
        const producer = await transport.produce(params);
        console.log(
          "[handleCreatedWebRtcTransportProducer] Producer created with id:",
          producer.id
        );
        producer.on("trackended", () => {
          console.log("[producer.trackended] Track ended");
        });
      } catch (error) {
        console.error(
          "[handleCreatedWebRtcTransportProducer] Error handling transport producer:",
          error
        );
      }
    },
    [device, getUserMedia, socket]
  );

  React.useEffect(() => {
    console.log("[useEffect] Setting up socket event listeners");
    socket.on("supportedRtpCapabilities", handleSupportedRtpCapabilities);
    socket.on(
      "createdWebRtcTransportProducer",
      handleCreatedWebRtcTransportProducer
    );
    return () => {
      console.log("[useEffect] Cleaning up socket event listeners");
      socket.off("supportedRtpCapabilities", handleSupportedRtpCapabilities);
      socket.off(
        "createdWebRtcTransportProducer",
        handleCreatedWebRtcTransportProducer
      );
    };
  }, [
    handleCreatedWebRtcTransportProducer,
    handleSupportedRtpCapabilities,
    socket,
  ]);

  React.useEffect(() => {
    console.log("[useEffect] Emitting getSupportedRtpCapabilities event");
    socket.emit("getSupportedRtpCapabilities");
  }, [socket]);

  return (
    <div>
      <h1>Room</h1>
      <p>This is the room page.</p>
    </div>
  );
}

export default Room;
