'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function getLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    cs: 'csharp',
    cpp: 'cpp',
    c: 'c',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    sql: 'sql',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    md: 'markdown',
    sh: 'bash',
    bash: 'bash',
    dockerfile: 'docker',
  };
  return map[ext] || 'text';
}

export function CodeViewer({
  path,
  content,
}: {
  path: string;
  content: string;
}) {
  return (
    <div className="h-full overflow-auto">
      <div className="sticky top-0 border-b border-slate-800 bg-slate-900 px-4 py-2">
        <p className="font-mono text-sm text-slate-400">{path}</p>
      </div>
      <SyntaxHighlighter
        language={getLanguage(path)}
        style={oneDark}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.8rem',
        }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
