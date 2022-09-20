import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPythonInstructor, PythonInstructor } from "~/lib/pythonInstructor";
import { IFile } from "~/types/files";
import { IRunnerOutput } from "~/types/python.worker";
import { ITestCaseLoaded } from "~/types/testCases";

const PythonRunnerContext = createContext<null | ICodeContext>(null);

function useWorkers(number: number) {
  const [workers, setWorkers] = useState<PythonInstructor[]>([]);

  useEffect(() => {
    const promises = Array(number)
      .fill(null)
      .map(() => createPythonInstructor());
    let workers: PythonInstructor[];
    const promise = Promise.all(promises).then((createdWorkers) => {
      workers = createdWorkers;
      setWorkers(workers);
    });
    return () => {
      promise.then(() => workers.forEach((worker) => worker.destroy()))
    };
  }, [number]);

  return workers;
}

type Callback = (index: number, result: IRunnerOutput) => void;
type QueueItem = [index: number, files: IFile[], test: ITestCaseLoaded, resolve: Callback];
type RunnerFn = (testCases: ITestCaseLoaded[], files: IFile[], callback: Callback) => void;

export type ICodeContext = {
  runTestCases: RunnerFn;
  threads: number;
  setThreads: (number: number) => void;
  isReady: boolean;
  interrupt: () => void;
  isRunning: boolean;
};


export default function PythonRunnerProvider({ ...props }) {
  const [threads, setThreads] = useState(2);
  const workers = useWorkers(threads);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const isReady = workers.length === threads;
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isReady) return;
    let localQueue = queue;

    const runNext = (worker: PythonInstructor) => {
      if (localQueue.length === 0) return
      const isLast = localQueue.length === 1;
      const [index, files, test, resolve] = localQueue.shift() as QueueItem;
      const { entrypoint, zipFiles, input } = test;
      worker.runCode({ entrypoint, files, input, zipFiles }).then((result) => {
        if (isLast) setIsRunning(false);
        resolve(index, result);
        runNext(worker);
      });
    };

    workers.forEach((worker) => runNext(worker));

    return () => {
      localQueue = []
    };
  }, [queue, workers, isReady, isRunning]);

  const runTestCases = useCallback<RunnerFn>((testCases, files, callback) => {
    setIsRunning(true)
    setQueue(testCases.map((test, index) => [index, files, test, callback]));
  }, []);


  const interrupt = useCallback(() => {
    setQueue([]);
    workers.map((worker) => worker.interrupt());
    setIsRunning(false)
  }, [workers]);


  return <PythonRunnerContext.Provider value={{ threads, runTestCases, setThreads, isReady, isRunning, interrupt }} {...props} />;
}

export function usePythonRunner() {
  const context = useContext(PythonRunnerContext);
  if (context === null) {
    throw new Error("usePythonRunner must be used within a PythonRunnerProvider");
  }
  return context;
}
