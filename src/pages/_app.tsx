import "~/globals.css";
import type { AppProps } from "next/app";
import PythonRunnerProvider from "~/lib/pythonRunner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PythonRunnerProvider>
      <Component {...pageProps} />;
    </PythonRunnerProvider>
  )
}
