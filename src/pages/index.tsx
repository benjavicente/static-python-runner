import { GetStaticProps, InferGetStaticPropsType } from "next";
import { createPythonInstructor } from "~/lib/pythonInstructor";
import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

export type Props = {
  exercises: string[];
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const exercises = await fs.readdir(path.join(process.cwd(), "public/exercises"));
  return {
    props: { exercises },
  };
};

export default function Home({ exercises }: Props) {
  const test = async () => {
    const pythonInstructor = await createPythonInstructor();
    const test = {
      entrypoint: "main",
      input: ["Hello World"],
      files: [{ name: "main.py", content: "print(input())" }],
    };
    const result = await pythonInstructor.runCode(test);
    console.log(result);
  };

  return (
    <div>
      <button onClick={() => test()}>Test</button>
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise}>
            <Link href={`/${exercise}`}>
              <a>{exercise}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
