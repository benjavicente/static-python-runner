/// <reference lib="webworker" />
import type { loadPyodide as loadPyodideValue, PyodideInterface } from "pyodide";
import { IRunnerArgs, IRunnerCmd, IRunnerCmdResponse, RUN_CODE, SET_INTERRUPT, STATUS } from "~/types/python.worker";
declare const loadPyodide: typeof loadPyodideValue;
declare type PyoditeLoaderOptions = Parameters<typeof loadPyodideValue>[0];

let pyodide: PyodideInterface;

const state = {
  stdout: [] as string[],
  stderr: [] as string[],
  stdin: [] as string[],
  interruptBuffer: new Uint8Array(1),
  resetWithInput: (input: string[]) => {
    state.stdout = [];
    state.stderr = [];
    state.stdin = input;
  },
};

const pyoditeOptions: PyoditeLoaderOptions = {
  stdout: (d: string) => state.stdout.push(d),
  stderr: (d: string) => state.stderr.push(d),
  // @ts-ignore
  stdin: () => state.stdin.shift(),
};

const pythonEntry = (module: string) => `
import sys
from pathlib import Path
for path in Path.cwd().iterdir():
    if path.suffix == ".py" and path.stem in sys.modules:
        del sys.modules[path.stem]
import ${module}
`;

async function runCode({ files, zipFiles, input, entrypoint }: IRunnerArgs) {
  // 0. Reset old state
  let error = false;
  state.resetWithInput(input);
  // 1. Create files to test
  for (const file of files) {
    pyodide.FS.writeFile(file.name, file.content);
  }
  // 2. Create test files
  if (zipFiles) {
    pyodide.unpackArchive(zipFiles, "zip");
  }
  // 3. Run the code
  try {
    await pyodide.runPythonAsync(pythonEntry(entrypoint));
  } catch (error) {
    error = true;
  }
  // 4. Return the output
  return { stdout: state.stdout, stderr: state.stderr, error };
}

async function handleMessage(data: IRunnerCmd) {
  if (data.cmd === RUN_CODE) {
    return runCode(data);
  } else if (data.cmd === SET_INTERRUPT) {
    state.interruptBuffer = data.interruptBuffer;
  } else if (data.cmd === STATUS) {
    return { status: "ok" };
  }
}

async function load() {
  pyodide = await loadPyodide(pyoditeOptions);
}

importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js");

const loader = load();
addEventListener("message", async ({ data }: { data: IRunnerCmd }) => {
  await loader;
  postMessage({ cmd: data.cmd, ...(await handleMessage(data)) } as IRunnerCmdResponse);
});
