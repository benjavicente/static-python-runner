import React, {
  useState, createContext, useEffect, useCallback, useContext, useMemo,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactDiffViewer from 'react-diff-viewer';
import { useTestCases, useCodeRun } from '~/lib/CodeContext';
import readmeExample from '~/../public/Readme.md?raw';
import CodeMirror from '@uiw/react-codemirror';
import { ITestCaseStatus } from "../lib/types"


export default function App() {
  const testCases = useTestCases();
  console.log(testCases);
  const runCode = useCodeRun();
  const [seeDiff, setSeeDiff] = useState(false);
  const [code, setCode] = useState("# Escribe tú código aquí\n");

  return (
    <div className="grid grid-cols-2 h-screen max-h-screen">
      <ReactMarkdown className="prose h-full max-w-none p-10 overflow-y-scroll text-justify" children={readmeExample} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} />
      <div className="flex flex-col p-10 h-full overflow-y-scroll">
        <div>
          <CodeMirror className="rounded-xl" value={code} onChange={(value) => setCode(value)} lang="py" />
          <button type="button" className="btn mb-10" onClick={() => { runCode([{ name: 'main.py', content: code }]); setSeeDiff(true); }}>Run code</button>
        </div>
        <ul className="flex flex-col gap-2">
          {testCases.map((testCase) => (
            <li key={testCase.test.id} className="border border-base-300 bg-base-100 rounded-box">
              <details>
                <summary className='text-xl font-medium p-4 cursor-pointer'>
                  {testCase.name}
                  ({testCase.result.status})
                </summary>
                <div className='p-4 flex flex-col gap-6'>
                  <div className="flex flex-col gap-2">
                    <p className="font-bold">Input:</p>
                    <pre className="bg-code  px-4 py-2 rounded-md w-full overflow-x-auto">
                      <code>
                        {testCase.test.input.join('\n')}
                      </code>
                    </pre>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-bold">Expected Output:</p>
                    <pre className="bg-code px-4 py-2 rounded-md w-full overflow-x-auto">
                      <code>
                        {testCase.expectedOutput.join('\n')}
                      </code>
                    </pre>
                  </div>
                  {([ITestCaseStatus.PASSED, ITestCaseStatus.EMPTY].includes(testCase.result.status)) || (
                    <>
                      <div className="flex flex-col gap-2">
                        <p className="font-bold">Output:</p>
                        <pre className="bg-code px-4 py-2 rounded-md w-full overflow-x-auto">
                          <code>
                            {testCase.result.output.join('\n')}
                          </code>
                        </pre>
                      </div>
                      <div>
                        <p className="font-bold">Diff:</p>
                        <ReactDiffViewer
                          oldValue={testCase.expectedOutput.join('\n')}
                          newValue={testCase.result.output.join('\n')}
                          splitView
                        />
                      </div>
                    </>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
