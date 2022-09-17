import React, {
  useState, createContext, useEffect, useCallback, useContext, useMemo,
} from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import type { ICodeContext, IStaticExercise, ITestCaseStateInfo } from '~/lib/types';
import PythonWorkerURL from '~/lib/worker?url';

const runCode = () => {
  interruptBuffer[0] = 0;
  console.log('Running code');
  setIsRunning(true);
  worker.postMessage({ cmd: 'runCode', code, input: ['miaumiau'] });
};

export default function TestCaseAwnser(props) {
  const { correctOuput } = props;
  const [code, setCode] = useState('print(input(), input())');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [seeDiff, setSeeDiff] = useState(false);
  const [data, setData] = useState<{ output?: string, error?: string }>({});

  return (
    <div>
      <div>
        <h3>Output</h3>
        <textarea className="textarea w-full" value={data.output} readOnly />
        <h3>Error</h3>
        <textarea className="textarea w-full" value={data.error} readOnly />
      </div>
      {(seeDiff === true) && <ReactDiffViewer oldValue={data.output} newValue={correctOuput} splitView />}
    </div>
  );
}
