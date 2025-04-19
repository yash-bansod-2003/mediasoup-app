
export const configuration = Object.freeze({
  workerSettings: {
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: "debug",
    logTags: [
      "info",
      "ice",
      "dtls",
      "rtp",
      "rtcp",
      "srtp",
    ],
  },
  routerOptions: {
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
        parameters: {
          maxplaybackrate: 48000,
          useinbandfec: 1,
          usedtx: 1,
          maxaveragebitrate: 64000,
          cbr: 1,
        },
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          xGoogleStartBitrate: 1000,
        },
      },
    ]
  },
  webRtcTransport: {
    listenInfos: [
      {
        protocol: "udp",
        ip: "0.0.0.0",
        announcedAddress: "127.0.0.1"
      }
    ]
  }
})
