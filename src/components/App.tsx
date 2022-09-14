import React, {
  useState, createContext, useEffect, useCallback, useContext, useMemo,
} from 'react';
import { useTestCases } from '~/lib/CodeContext';

export default function App() {
  const testCases = useTestCases();
  console.log(testCases);
  return (
    <div className="flex flex-col gap-10">
      {testCases.map((testCase) => (
        <div key={testCase.test.id}>
          <h1>{testCase.name}</h1>
          <p>Input:</p>
          <pre>{testCase.test.input}</pre>
          <p>Expected Output:</p>
          {testCase.expectedOutput.map((output) => (
            <pre>{output}</pre>
          ))}
          <div>{testCase.result?.status}</div>
        </div>
      ))}
    </div>
  );
}
