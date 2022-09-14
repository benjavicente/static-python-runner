/// <reference lib="webworker" />
import type { PyodideInterface } from 'pyodide';

const isRunning = false;
const output = [];
const error = [];
const input = [];
let interruptBuffer;
