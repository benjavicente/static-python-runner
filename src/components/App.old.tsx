import ReactDiffViewer from 'react-diff-viewer';
import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import PythonWorkerURL from '../lib/python.worker?url';

const worker = new Worker(PythonWorkerURL);

function App() {
  const [code, setCode] = useState('print(input(), input())');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [seeDiff, setSeeDiff] = useState(false);
  const [data, setData] = useState<{ output?: string, error?: string }>({});

  useEffect(() => {
    const eventListener = (event: MessageEvent) => {
      const { data } = event;
      console.log(data);
      if (data.cmd === 'loaded') {
        setIsLoading(false);
      } else if (data.cmd === 'output') {
        setIsRunning(false);
        setData({ output: data.output, error: data.error });
      }
    };
    worker.addEventListener('message', eventListener);
    return () => worker.removeEventListener('message', eventListener);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
  worker.postMessage({ cmd: 'setInterruptBuffer', interruptBuffer });

  const interruptCode = () => {
    interruptBuffer[0] = 2;
    setIsRunning(false);
  };

  const runCode = () => {
    interruptBuffer[0] = 0;
    console.log('Running code');
    setIsRunning(true);
    worker.postMessage({ cmd: 'runCode', code, input: ['miaumiau'] });
  };

  const newCode = 'hola\nchao';

  return (
    <div>
      {/* Create a text field for code */}
      <CodeMirror value={code} onChange={(value) => setCode(value)} lang="py" />
      {/* Create a button to run the code */}
      <div className="w-full flex gap-2">
        <button className="btn" onClick={() => { runCode(); setSeeDiff(true); }}>Run</button>
        <button className="btn" disabled={!isRunning} onClick={() => interruptCode()}>Interrupt</button>
      </div>
      {/* Create a text field for the output */}
      <div>
        <h3>Output</h3>
        <textarea className="textarea w-full" value={data.output} readOnly />
        <h3>Error</h3>
        <textarea className="textarea w-full" value={data.error} readOnly />
      </div>
      {(seeDiff === true) && <ReactDiffViewer oldValue={data.output} newValue={newCode} splitView />}
    </div>
  );
}

export default App;
