/// <reference lib="webworker" />
import type { PyodideInterface } from "pyodide";

let isRunning = false;
let output = [];
let error = [];
let input = [];
let interruptBuffer;
