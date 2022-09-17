/// <reference lib="webworker" />
import type { PyodideInterface } from "pyodide";
import type { IFileObj, ITestCase, IRunCodeTestOutput } from "./types";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.2/full/pyodide.js");

const isRunning = false;
let interruptBuffer;
let pyodide: PyodideInterface;

const pythonConsole = {
  stdout: [] as string[],
  stderr: [] as string[],
  stdin: [] as string[],
  resetWithInput: (input: string[]) => {
    pythonConsole.stdout = [];
    pythonConsole.stderr = [];
    pythonConsole.stdin = input;
  },
};

const pyoditeOptions = {
  homedir: "/code",
  stdout: (data: string) => pythonConsole.stdout.push(data),
  stderr: (data: string) => pythonConsole.stderr.push(data),
  stdin: () => pythonConsole.stdin.shift(),
};

const pyodideReadyPromise = loadPyodideAndPackages();

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide(pyoditeOptions);
}

async function runTestCase({ files, test }: { files: IFileObj[]; test: ITestCase }) {
  await pyodideReadyPromise;
  //! 1. Resetear los archivos virtuales que hay
  //! 2. Cargar los archivos del alumno
  files.forEach((file) => {
    pyodide.FS.writeFile(`/code/${file.name}`, file.content);
  });
  // 3. Cargar los archivos del test
  if (test.files) {
    pyodide.unpackArchive(test.files, "zip");
  }
  // 4. Limpiar y setear input, output y stderr
  pythonConsole.resetWithInput(test.input);
  //! 5. Ejecutar el test a partir del entrypoitn
  try {
    await pyodide.runPythonAsync(`
      import sys
      from pathlib import Path
      # resetear cache de archivos importados
      for path in Path.cwd().iterdir():
          if path.suffix == ".py" and path.stem in sys.modules:
              del sys.modules[path.stem]
      import ${test.entrypoint}
      `);
  } catch (error) {
    console.log("error", error);
  }
  // 6. Devolver el resultado
  const { stdout, stderr } = pythonConsole;

  const result = {
    id: test.id,
    output: stdout,
    error: stderr,
    time: -1,
    result: "ok",
  } as IRunCodeTestOutput;
  postMessage(result);
  // postMessage({ type: 'testResult', payload: { output, error } });
}

addEventListener("message", async ({ data: { cmd, ...data } }) => {
  switch (cmd) {
    case "run":
      await runTestCase(data);
      break;
    case "setInterruptBuffer":
      break;
    default:
      break;
  }
});
