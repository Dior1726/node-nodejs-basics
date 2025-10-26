import { Worker } from "worker_threads";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const performCalculations = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workerPath = path.join(__dirname, "worker.js");

  const cpuCount = os.cpus().length;
  const startNumber = 10;

  const results = await Promise.all(
    Array.from({ length: cpuCount }, (_, i) => {
      return new Promise((resolve) => {
        const worker = new Worker(workerPath);
        const numberToSend = startNumber + i;

        worker.postMessage(numberToSend);

        worker.on("message", (result) => {
          resolve({ status: "resolved", data: result });
        });

        worker.on("error", () => {
          resolve({ status: "error", data: null });
        });

        worker.on("exit", (code) => {
          if (code != 0) {
            resolve({ status: "error", data: null });
          }
        });
      });
    })
  );

  console.log(results);
};

await performCalculations();
