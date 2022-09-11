/// <reference lib="webworker" />
import type { PyodideInterface } from "pyodide";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.2/full/pyodide.js");

let isRunning = false;
let output = [];
let error = [];
let input = [];
let interruptBuffer;

const pyoditeOptions = {
  stdout: (d) => output.push(d),
  stderr: (d) => error.push(d),
  stdin: () => input.shift(),
};

function rmDirRecursive(FS, initialDir) {
  impl(initialDir);
  function impl(dir: string) {
    for (const name of FS.readdir(dir)) {
      if (name === "." || name === "..") continue;
      const path = `${dir}/${name}`;
      const { mode } = FS.lookupPath(path).node;
      if (FS.isFile(mode)) {
        FS.unlink(path);
      } else if (FS.isDir(mode)) {
        impl(path);
        FS.rmdir(path);
      }
    }
  }
}

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide(pyoditeOptions);
}

async function interrupt() {
  await pyodideReadyPromise;
  self.pyodide.setInterruptBuffer(interruptBuffer);
  self.postMessage({ cmd: "output", output: output.join("\n"), error: error.join("\n"), interrupted: true });
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.addEventListener("message", async (msg) => {
  await pyodideReadyPromise;
  console.log("Python worker received message:", msg);

  self.postMessage({ cmd: "ok" });

  if (msg.data.cmd === "setInterruptBuffer") {
    interruptBuffer = msg.data.interruptBuffer;
  } else if (msg.data.cmd === "runCode") {
    output = [];
    error = [];
    input = msg.data.input;
    isRunning = true;

    const timeoutId = setTimeout(() => interrupt(), 10);

    // Load FS
    const mount = "/mnt";
    self.console.log("Mounting FS");
    try {
      self.pyodide.FS.mkdir(mount);
      self.pyodide.FS.mount(self.pyodide.FS.filesystems.IDBFS, { root: "." }, mount);
    } catch (e) {
      self.console.log("FS already mounted");
    }
    const zipBinary = await fetch("/archivos.zip").then((r) => r.arrayBuffer());
    self.pyodide.unpackArchive(zipBinary, "zip");

    // Run code
    self.pyodide
      .runPythonAsync(msg.data.code)
      .then(() => {
        self.postMessage({ cmd: "output", output: output.join("\n"), error: error.join("\n") });
        clearTimeout(timeoutId);
        isRunning = false;
      })
      .catch((e) => {
        // TODO: handle error
        // https://pyodide.org/en/stable/usage/type-conversions.html#errors
        console.log(e);
        self.postMessage({ cmd: "output", error: e.toString(), output: output.join("\n") });
        clearTimeout(timeoutId);
        isRunning = false;
      })
      .finally(() => {
        // Remove files
        rmDirRecursive(self.pyodide.FS, mount);
      });
  }
});
