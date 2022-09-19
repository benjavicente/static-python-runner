/* Wrapper around the Python Worker */
import { SET_INTERRUPT, STATUS, RUN_CODE, IRunnerCmdResponse, IRunnerOutput, IRunnerArgs } from "~/types/python.worker";

type Resolver = (data: IRunnerOutput) => void;
type IPostMessage = (msg: IRunnerCmdResponse) => void;
type PythonWorker = { postMessage: IPostMessage } & Worker;

export type PythonInstructor = {
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
    let startTime: number | undefined = undefined;

    const response = {
      destroy: () => w.terminate(),
      runCode: (args: IRunnerArgs) => {
        if (startTime) throw new Error("Cannot run code while running code");
        interruptBuffer[0] = 0;
        startTime = Date.now();
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
          if (currentResolver && startTime) {
            // Note(benjavicente): Aquí se podría retornar más datos de ejecución
            const { stdout, stderr, error } = data;
            currentResolver({ stdout, stderr, error, time: Date.now() - startTime });
          }
      }
    };

    w.addEventListener("message", handleEvent);
    w.postMessage({ cmd: SET_INTERRUPT, interruptBuffer });
    w.postMessage({ cmd: STATUS });
  });
