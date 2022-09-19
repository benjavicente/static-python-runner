import { createContext, useEffect, useState } from "react";
import { createPythonInstructor, PythonInstructor } from "~/lib/pythonInstructor";

export type ICodeContext = {};

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


// TODO: ver como organizar los test cases y el queue de estos
export default function PythonRunnerProvider({ ...props }) {
  const [threads, setThreads] = useState(3);
  const workers = useWorkers(threads);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (workers.length === 0) return;

    // copilot suggestion
    const runNext = () => {
      if (queue.length === 0) return;
      const [test, resolve] = queue.shift();
      const worker = workers.shift();
      worker.runCode(test).then((result) => {
        resolve(result);
        workers.push(worker);
        runNext();
      });
    };

    return () => {
      second;
    };
  }, [queue, workers]);

  return <PythonRunnerContext.Provider value={null} {...props} />;
}
