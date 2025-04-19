import * as mediasoup from "mediasoup";
import { configuration } from "./configuration.js";

export const createRouter = async () => {
  const worker = await mediasoup.createWorker(
    {
      logLevel: configuration.workerSettings.logLevel,
      logTags: configuration.workerSettings.logTags,
      rtcMinPort: configuration.workerSettings.rtcMinPort,
      rtcMaxPort: configuration.workerSettings.rtcMaxPort,
    });

  worker.on("died", () => {
    console.error(
      "mediasoup worker has died, exiting in 2 seconds... [pid:%d]",
      worker.pid
    );
    setTimeout(() => process.exit(1), 2000);
  });

  console.log("Worker created with pid:", worker.pid);
  const router = await worker.createRouter({
    mediaCodecs: configuration.routerOptions.mediaCodecs,
  });
  console.log("Router created with id:", router.id);
  return router;
}