// Public Files

/** Static data of a test case, loaded from a JSON file. */
export type IStaticTestCase = {
  id: string;
  name: string;
  input: string[];
  startingCode: string;
  filesZipUrl?: string;
  isPublic: boolean;
  points: number;
  expectedOutput: string[];
};

/** Static data of a exercise, loaded from a JSON file. */
export type IStaticExercise = {
  /** An array of test cases to load for this exercise */
  testCases: IStaticTestCase[];
};

// Code context
export enum ITestCaseStatus {
  PASSED, // verde
  FAILED, // rojo
  TIMEOUT, // amarillo
  EMPTY, // gris
}

/** Non-changing data of a test case */
export type ITestCaseStateInfo = {
  test: ITestCase;
  name: string;
  points: number;
  isPublic: boolean;
  expectedOutput: string[];
};

/** Changing data of a test case */
export type ITestCaseResult = {
  id: string;
  status: ITestCaseStatus;
  output: string[];
  error: string[];
};

/** State of the global testcase */
export type ICodeContext = {
  ready: boolean;
  testCases: ITestCaseStateInfo[];
  testCaseResults: ITestCaseResult[];
};

// Client

export type IRunCodeTestGlobal = {
  /** archivos del alumno */
  files: { name: string; content: string }[];
};

/** Payload of the event that is emitted when a test case is executed. */
export type ITestCase = {
  /** identificador para la respuesta */
  id: string;
  /** stdin */
  input: string[];
  /** código que se corre  */
  startingCode: string;
  /** archivos */
  files?: ArrayBuffer; // zip
};

// Worker

export enum IRunCodeState {
  RUNNING,
  IDLE,
  CANCELED,
}

/** responde on worker ping */
export type IRunCodeStatus = {
  status: IRunCodeState;
};

export type IRunCodeTestOutput = {
  /** identificador del test case */
  id: string;
  /** output despues de correrlo */
  output: string[];
  /** tiempo de ejecución */
  time: number;
  /** error */
  ok: boolean;
  error: string;
  canceled: boolean;
};
