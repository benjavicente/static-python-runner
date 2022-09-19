import { IRunnerOutput } from "~/types/python.worker";

export type ITestCasesData = {
  baseUrl: string;
  testCases: IBaseTestCase[];
};

export type IBaseTestCase = {
  id: string;
  isPublic: boolean;
  name: string;
  points: number;
  input: string[];
  entrypoint: string;
  expectedOutput: string[];
};

export type ITestCaseFile = IBaseTestCase & {
  zipFilesUrl?: string;
};

export type ITestCaseLoaded = IBaseTestCase & {
  zipFiles?: ArrayBuffer;
};

export enum TestCaseResultState {
  CORRECT = "correct",
  INCORRECT = "incorrect",
  ERROR = "error",
  NONE = "none",
  RUNNING = "running",
}

export type ITestCaseResult = Omit<IRunnerOutput, "error"> & {
  state: TestCaseResultState;
};
