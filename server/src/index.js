import http from "node:http"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { Server } from "socket.io"

import { createRouter } from "./worker.js"
import { createWebRtcTransport } from "./transport.js"

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.FRONTEND_BASE_URL }))
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_BASE_URL,
    methods: ["GET", "POST"],
  },
});

console.log("Initializing router...")
const router = await createRouter()
console.log("Router created")

io.on("connection", (socket) => {
  console.log(`A user connected with id: ${socket.id}`)

  socket.on("join:room", (data) => {
    console.log(`Socket ${socket.id} requested to join room with data:`, data)
    const { roomId } = data;
    socket.emit("joined:room", { roomId })
    console.log(`Socket ${socket.id} joined room: ${roomId}`)
  })

  socket.on("getSupportedRtpCapabilities", () => {
    console.log(`Socket ${socket.id} requested supported RTP capabilities`)
    socket.emit("supportedRtpCapabilities", router.rtpCapabilities)
    console.log(`Sent RTP capabilities to socket ${socket.id}:`)
  })

  socket.on("createWebRtcTransportProducer", (data) => {
    console.log(`Socket ${socket.id} requested to create a WebRTC transport with data:`, data)
    const transport = createWebRtcTransport(router);
    socket.emit("createdWebRtcTransportProducer", transport);
    console.log(`Created WebRTC transport for socket ${socket.id}:`, transport)
  })

  socket.on("connectWebRtcTransportProducer", (data) => {
    console.log(`Socket ${socket.id} requested to connect WebRTC transport with data:`, data)
    const { dtlsParameters, transportId } = data;
    const transport = router.getTransportById(transportId);
    if (transport) {
      transport.connect({ dtlsParameters });
      socket.emit("connectedWebRtcTransportProducer");
      console.log(`Transport ${transportId} connected for socket ${socket.id} with DTLS parameters:`, dtlsParameters)
    } else {
      console.log(`Transport with id ${transportId} not found for socket ${socket.id}`)
    }
  })

  socket.on("produceWebRtcTransportProducer", (data) => {
    console.log(`Socket ${socket.id} requested to produce on WebRTC transport with data:`, data)
    const { transportId, kind, rtpParameters } = data;
    const transport = router.getTransportById(transportId);
    if (transport) {
      const producer = transport.produce({ kind, rtpParameters });
      socket.emit("producedWebRtcTransportProducer", { id: producer.id });
      socket.broadcast.emit("newProducer", { id: producer.id });
      console.log(`Produced new media of kind ${kind} for socket ${socket.id} with producer id: ${producer.id}`)
    } else {
      console.log(`Transport with id ${transportId} not found for socket ${socket.id}`)
    }
  })

  socket.on("message", (msg) => {
    console.log(`Message received from socket ${socket.id}:`, msg)
    io.emit("message", msg)
    console.log("Broadcasted message:", msg)
  })

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`)
  })
})

server.listen(5000, "0.0.0.0", () => {
  console.log("Server is running on http://localhost:5000")
})