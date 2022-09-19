export type ITestCasesData = {
  baseUrl: string;
  testCases: IBaseTestCase[];
};

export type IBaseTestCase = {
  isPublic: boolean;
  name: string;
  points: number;
  files: File[];
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
