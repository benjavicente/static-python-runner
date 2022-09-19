import { GetStaticPaths, GetStaticProps } from "next/types";
import { promises as fs } from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ITestCaseLoaded, ITestCaseResult, ITestCasesData, TestCaseResultState } from "~/types/testCases";
import useTestCasesLoader from "~/hooks/testCases";
import { basePath } from "/next.config";
import { usePythonRunner } from "~/lib/pythonRunner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { python } from "@codemirror/lang-python";
import ReactCodeMirror from "@uiw/react-codemirror";
import ReactDiffViewer from 'react-diff-viewer';

export type Props = {
  readmeContent: string;
  testCasesData: ITestCasesData;
};

export type Params = {
  exerciseId: string;
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { exerciseId } = params as Params;
  const processBasePath = path.join(process.cwd(), "public", "exercises", exerciseId);
  const readmeContent = await fs.readFile(path.join(processBasePath, "readme.md"), "utf-8");
  const testCasesRawContent = await fs.readFile(path.join(processBasePath, "testCases.json"), "utf-8");
  const testCasesData = JSON.parse(testCasesRawContent);
  console.log(testCasesData);
  return {
    props: { readmeContent, testCasesData: { ...testCasesData, baseUrl: `${basePath || ""}/exercises/${exerciseId}` } },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const exercises = await fs.readdir(path.join(process.cwd(), "public/exercises"));
  const paths = exercises.map((exercise) => ({ params: { exerciseId: exercise } }));
  return { paths, fallback: false };
};

export default function Exercise({ readmeContent, testCasesData }: Props) {
  const [testCases, isLoading] = useTestCasesLoader(testCasesData);
  const [testCasesResults, setTestCasesResults] = useState<ITestCaseResult[]>([]);
  const { runTestCases, isReady, isRunning, interrupt } = usePythonRunner();
  const [code, setCode] = useState("# Add your code here");

  useEffect(() => {
    if (isLoading) return
    setTestCasesResults(testCases.map(() => ({
      state: TestCaseResultState.NONE,
      time: 0,
      stderr: [],
      stdout: [],
    })))
  }, [testCases, isLoading]);

  const runCode = useCallback(() => {
    if (!isReady) throw new Error("Python runner is not ready");
    setTestCasesResults(prev => prev.map((tcr) => ({ ...tcr, state: TestCaseResultState.RUNNING })));
    runTestCases(testCases, [{ name: "main.py", content: code }], (i, { error, stderr, stdout, time }) => {
      setTestCasesResults((prev) => {
        const newResults = [...prev];
        let state = TestCaseResultState.INCORRECT;
        if (error) {
          state = TestCaseResultState.ERROR;
        } else if (testCases[i].expectedOutput.every((line, i) => line === stdout[i])) {
          state = TestCaseResultState.CORRECT;
        }
        newResults[i] = { stderr, stdout, time, state };
        return newResults;
      });
    });
  }, [testCases, runTestCases, isReady, code]);

  const tests: [ITestCaseLoaded, ITestCaseResult][] = useMemo(() => {
    return testCasesResults.map((_, i) => [testCases[i], testCasesResults[i]])
  }, [testCasesResults, testCases])

  const correctAnswers = useMemo(() => {
    return testCasesResults.filter(({ state }) => state === TestCaseResultState.CORRECT).length
  }, [testCasesResults])

  const interruptCode = useCallback(() => {
    interrupt();
    setTestCasesResults(prev => prev.map(({ state, ...tcr }) => {
      return { ...tcr, state: state === TestCaseResultState.RUNNING ? TestCaseResultState.NONE : state }
    }))
  }, [interrupt, setTestCasesResults]);

  return (
    <div className="grid grid-cols-2 h-screen max-h-screen">
      <ReactMarkdown className="prose h-full max-w-none p-10 overflow-y-scroll text-justify" children={readmeContent} remarkPlugins={[remarkGfm]} />
      <div className="flex flex-col p-10 h-full overflow-y-scroll">
        <div>
          <ReactCodeMirror
            className="rounded-xl text-gray-700"
            value={code}
            onChange={(value) => setCode(value)}
            lang="py"
            extensions={[python()]}
          />
          <div className="flex gap-4">
            <button disabled={isLoading || !isReady || isRunning} type="button" className="btn mb-10 mt-4" onClick={() => runCode()}>Run code</button>
            <button disabled={!isRunning} type="button" className="btn mb-10 mt-4" onClick={() => interruptCode()}>Interrupt</button>
          </div>
        </div>
        <div>
          <p className='text-xl font-medium px-2 pb-4 cursor-pointer'>
            Correct answers {correctAnswers} / {testCases.length}
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {tests.map(([testCase, result]) => (
            <li key={testCase.id} className="border border-base-300 bg-base-100 rounded-box">
              <details>
                <summary className='text-xl font-medium p-4 cursor-pointer'>
                  {testCase.name}
                  ({result.state})
                </summary>
                <div className='p-4 flex flex-col gap-6'>
                  <div className="flex flex-col gap-2">
                    <p className="font-bold">Input:</p>
                    <pre className="bg-code  px-4 py-2 rounded-md w-full overflow-x-auto">
                      <code>
                        {testCase.input.join('\n')}
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
                  {([TestCaseResultState.CORRECT, TestCaseResultState.NONE].includes(result.state)) || (
                    <>
                      <div className="flex flex-col gap-2">
                        <p className="font-bold">Output:</p>
                        <pre className="bg-code px-4 py-2 rounded-md w-full overflow-x-auto">
                          <code>
                            {result.stdout.join('\n')}
                          </code>
                        </pre>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="font-bold">Error:</p>
                        <pre className="bg-code px-4 py-2 rounded-md w-full overflow-x-auto">
                          <code>
                            {result.stderr.join('\n')}
                          </code>
                        </pre>
                      </div>
                      <div>
                        <p className="font-bold">Diff:</p>
                        <ReactDiffViewer
                          newValue={result.stdout.join('\n')}
                          oldValue={testCase.expectedOutput.join('\n')}
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
