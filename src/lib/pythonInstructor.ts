/* Wrapper around the Python Worker */
import { SET_INTERRUPT, STATUS, RUN_CODE, IRunnerCmdResponse, IRunnerOutput, IRunnerArgs } from "~/types/python.worker";

type Resolver = (data: IRunnerOutput) => void;
type IPostMessage = (msg: IRunnerCmdResponse) => void;
type PythonWorker = { postMessage: IPostMessage } & Worker;

let nextId = 0;
const id = () => nextId++;

export type PythonInstructor = {
  id: number;
  runCode: (args: IRunnerArgs) => Promise<IRunnerOutput>;
  interrupt: () => void;
  destroy: () => void;
};

/**
 * Creador de PythonWorkers
 * ========================
 *
 * @example
 * const pythonInstructor = await createPythonInstructor();
 * const result = await pythonInstructor.runCode({
 *   entrypoint: "main",
 *   input: ["Hello World"],
 *   files: [{ name: "main.py", content: "print(input())" }],
 * });
 * console.log(result);
 */
export const createPythonInstructor = (): Promise<PythonInstructor> =>
  new Promise((createResolver) => {
    const w: PythonWorker = new Worker(new URL("../python.worker.ts", import.meta.url));
    const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
    let currentResolver: Resolver | undefined = undefined;
    let isRunning = false;

    const response = {
      id: id(),
      destroy: () => w.terminate(),
      runCode: (args: IRunnerArgs) => {
        if (isRunning) throw new Error("Cannot run code while running another code");
        interruptBuffer[0] = 0;
        isRunning = true;
        const promise: Promise<IRunnerOutput> = new Promise((runnerResolver) => (currentResolver = runnerResolver));
        w.postMessage({ cmd: RUN_CODE, ...args });
        return promise;
      },
      interrupt: () => {
        interruptBuffer[0] = 2;
      },
    };

    const handleEvent = ({ data }: { data: IRunnerCmdResponse }) => {
      switch (data.cmd) {
        case STATUS:
          return createResolver(response);
        case RUN_CODE:
          if (currentResolver && isRunning) {
            const { cmd, ...result } = data;
            currentResolver(result);
            isRunning = false;
          }
      }
    };

    w.addEventListener("message", handleEvent);
    w.postMessage({ cmd: SET_INTERRUPT, interruptBuffer });
    w.postMessage({ cmd: STATUS });
  });
