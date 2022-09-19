import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps } from "next/types";
import { promises as fs } from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ITestCasesData } from "~/types/testCases";
import useTestCasesLoader from "~/hooks/testCases";
import { basePath } from "/next.config";

export type Props = {
  readmeContent: string;
  testCasesData: ITestCasesData;
};

export type Params = {
  exerciseId: string;
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { exerciseId } = params as Params;
  const processBasePath = path.join(process.cwd(), "public", "exercises", exerciseId);
  const readmeContent = await fs.readFile(path.join(processBasePath, "readme.md"), "utf-8");
  const testCasesRawContent = await fs.readFile(path.join(processBasePath, "testCases.json"), "utf-8");
  const testCasesData = JSON.parse(testCasesRawContent);
  console.log(testCasesData);
  return {
    props: { readmeContent, testCasesData: { ...testCasesData, baseUrl: `${basePath || ""}/exercises/${exerciseId}` } },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const exercises = await fs.readdir(path.join(process.cwd(), "public/exercises"));
  const paths = exercises.map((exercise) => ({ params: { exerciseId: exercise } }));
  return { paths, fallback: false };
};

export default function Exercise({ readmeContent, testCasesData }: Props) {
  const router = useRouter();
  const { exerciseId } = router.query;
  const [testCases, isLoading] = useTestCasesLoader(testCasesData);

  return (
    <div>
      <h1>Exercise {exerciseId}</h1>
      <ReactMarkdown children={readmeContent} className="prose" remarkPlugins={[remarkGfm]} />
      {JSON.stringify(testCases)}
    </div>
  );
}
