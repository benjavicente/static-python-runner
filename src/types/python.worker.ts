import type { IFile } from "~/types/files";

export type IRunnerArgs = {
  /* Module that serves as the entry point. */
  entrypoint: string;
  /* Files to be used in the execution. */
  files: IFile[];
  /* Additional files in zip format. */
  zipFiles?: ArrayBuffer;
  /* Input to be used in the execution. */
  input: string[];
};

export type IRunnerOutput = {
  /* Output of the execution. */
  stdout: string[];
  /* Error of the execution. */
  stderr: string[];
  /* Error of the execution. */
  error: boolean;
  /* Time of the execution. */
  time: number;
};

export enum RunnerCmdType {
  RUN_CODE = "runCode",
  SET_INTERRUPT = "setInterrupt",
  STATUS = "status",
}

export const { RUN_CODE, SET_INTERRUPT, STATUS } = RunnerCmdType;

export type IRunnerCmd =
  | { cmd: RunnerCmdType.STATUS }
  | { cmd: RunnerCmdType.SET_INTERRUPT; interruptBuffer: Uint8Array }
  | ({ cmd: RunnerCmdType.RUN_CODE } & IRunnerArgs);

export type IRunnerCmdResponse =
  | { cmd: RunnerCmdType.STATUS; status: "ready" }
  | { cmd: RunnerCmdType.SET_INTERRUPT }
  | ({ cmd: RunnerCmdType.RUN_CODE } & IRunnerOutput);
