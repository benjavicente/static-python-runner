import { useState, createContext, useEffect, useCallback, useContext, useMemo } from "react"
import type { ICodeContext, IStaticExercise, ITestCaseStateInfo } from "~/lib/types";
import PythonWorkerURL from '~/lib/worker?url';

const CodeContext = createContext<null | ICodeContext>(null);

async function loadTestCasesInfo(url: string) {
    const response = await fetch(url);
    const data: IStaticExercise = await response.json();
    const baseUrl = url.replace(/\/[^/]+$/, '/');
    // Se cargan todos los zips
    return await Promise.all(data.testCases.map(async (testCase): Promise<ITestCaseStateInfo> => {
        let zip: ArrayBuffer | undefined = undefined;
        if (testCase.filesZipUrl) {
            zip = await (await fetch(baseUrl + testCase.filesZipUrl)).arrayBuffer()
        }
        return {
            name: testCase.name,
            isPublic: testCase.isPublic,
            expectedOutput: testCase.expectedOutput,
            points: testCase.points,
            test: {
                id: testCase.id,
                files: zip,
                startingCode: testCase.startingCode,
                input: testCase.input,
            }
        }
    }))
}

export default function CodeProvider({ url, ...props }) {
    const [testCasesInfo, setTestCasesInfo] = useState<ITestCaseStateInfo[]>([])

    useMemo(() => {
        const worker = new Worker(PythonWorkerURL);
        return () => worker.terminate();
    }, [])

    useEffect(() => {
        loadTestCasesInfo(url).then(testCasesInfo => {
            setTestCasesInfo(testCasesInfo)
        })
    }, [url])


    console.log(url)
    console.log(testCasesInfo)


    return <CodeContext.Provider value={null} {...props} />
}
