import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '~/components/App';
import '~/main.css';
import CodeContext from '~/lib/CodeContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CodeContext url="/testCases/testCases.json">
      <App />
    </CodeContext>
  </React.StrictMode>,
);
