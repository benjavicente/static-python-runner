import { Html, Head, Main, NextScript } from "next/document";
import { basePath } from "/next.config";

export default function Document() {
  return (
    <Html>
      <Head>
        <script src={`${basePath || ""}/coi-serviceworker.min.js`} defer></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
