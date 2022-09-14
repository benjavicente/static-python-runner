import {
  useState, createContext, useEffect, useCallback, useContext, useMemo,
} from 'react';
import type {
  ICodeContext, IStaticExercise, ITestCaseStateInfo, IRunCodeTestOutput, IFileObj,
} from '~/lib/types';
import { ITestCaseStatus, IRunCodeTestResult } from '~/lib/types';
import PythonWorkerURL from '~/lib/worker?url';

const CodeContext = createContext<null | ICodeContext>(null);

async function loadTestCasesInfo(url: string) {
  const response = await fetch(url);
  const data: IStaticExercise = await response.json();
  const baseUrl = url.replace(/\/[^/]+$/, '/');
  // Se cargan todos los zips
  return await Promise.all(data.testCases.map(async (testCase): Promise<ITestCaseStateInfo> => {
    let zip: ArrayBuffer | undefined;
    if (testCase.filesZipUrl) {
      zip = await (await fetch(baseUrl + testCase.filesZipUrl)).arrayBuffer();
    }
    return {
      name: testCase.name,
      isPublic: testCase.isPublic,
      expectedOutput: testCase.expectedOutput,
      points: testCase.points,
      test: {
        id: testCase.id,
        files: zip,
        startingCode: testCase.startingCode,
        input: testCase.input,
      },
    };
  }));
}

function initTestCasesResults(testCases: ITestCaseStateInfo[]) {
  return testCases.reduce((resultsMapping, testCase) => {
    resultsMapping[testCase.test.id] = {
      status: ITestCaseStatus.EMPTY,
      output: [''],
      error: [''],
      time: 0,
    };
    return resultsMapping;
  }, {} as ICodeContext['testCaseResults']);
}

const worker = new Worker(PythonWorkerURL);
const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));

export default function CodeProvider({ url, ...props }) {
  const [testCases, setTestCases] = useState<ICodeContext['testCases']>([]);
  const [testCaseResults, setTestCaseResults] = useState<ICodeContext['testCaseResults']>({});
  const [ready, setReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    loadTestCasesInfo(url).then((testCasesInfo) => {
      setTestCases(testCasesInfo);
      setTestCaseResults(initTestCasesResults(testCasesInfo));
      setReady(true);
    });
  }, [url]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const {
        id, output, error, time, result,
      } = event.data as IRunCodeTestOutput;
      let status: ITestCaseStatus;
      switch (result) {
        case IRunCodeTestResult.OK:
          const expectedOutput = testCases.find((testCase) => testCase.test.id === id)?.expectedOutput;
          if (expectedOutput) {
            const eqOutput = output.every((line, i) => line === expectedOutput[i]);
            status = eqOutput ? ITestCaseStatus.PASSED : ITestCaseStatus.FAILED;
            break;
          }
          console.warn(`No se encontró el output esperado para el test ${id}`);
        case IRunCodeTestResult.TIMEOUT:
          status = ITestCaseStatus.TIMEOUT;
          break;
        case IRunCodeTestResult.ERROR:
          status = ITestCaseStatus.ERROR;
          break;
        case IRunCodeTestResult.CANCELED:
          status = ITestCaseStatus.CANCELED;
          break;
        default:
          status = ITestCaseStatus.EMPTY;
          break;
      }
      setTestCaseResults((results) => ({
        ...results,
        [id]: {
          status, output, error, time,
        },
      }));
    };
    worker.addEventListener('message', onMessage);

    return () => worker.removeEventListener('message', onMessage);
  }, []);

  const runCode = useCallback((files: IFileObj[]) => {
    // TODO
    interruptBuffer[0] = 0;
    setIsRunning(true);
    testCases.map(({ test }) => {
      // Change every test case status to empty
      setTestCaseResults((results) => ({ ...results, [test.id]: { ...results[test.id], status: ITestCaseStatus.EMPTY } }));
      worker.postMessage({ files, test });
    });
  }, [worker]);

  const interruptCode = useCallback(() => {
    // TODO
    interruptBuffer[0] = 2;
  }, [worker]);

  return (
    <CodeContext.Provider
      value={{
        testCases, testCaseResults, ready, runCode,
      }}
      {...props}
    />
  );
}

export function useCodeContext() {
  const context = useContext(CodeContext);
  if (!context) {
    throw new Error('useCodeContext must be used within a CodeProvider');
  }
  return context;
}

export function useCodeRun() {
  const { runCode } = useCodeContext();
  return runCode;
}

export function useTestCases() {
  const { ready, testCaseResults, testCases } = useCodeContext();
  if (!ready) {
    return [];
  }
  return testCases.map((testCase) => ({
    ...testCase,
    result: testCaseResults[testCase.test.id],
  }));
}
