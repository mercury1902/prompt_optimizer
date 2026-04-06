import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import type { MessageContentProps } from '../types/chat';

export function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const code = String(children).replace(/\n$/, '');

            if (!inline) {
              return <CodeBlock code={code} language={language} />;
            }

            return (
              <code
                className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          a({ node, children, ...props }: any) {
            return (
              <a
                className="text-blue-600 hover:underline dark:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          ul({ node, children, ...props }: any) {
            return (
              <ul className="list-disc pl-5 my-2" {...props}>
                {children}
              </ul>
            );
          },
          ol({ node, children, ...props }: any) {
            return (
              <ol className="list-decimal pl-5 my-2" {...props}>
                {children}
              </ol>
            );
          },
          li({ node, children, ...props }: any) {
            return (
              <li className="my-1" {...props}>
                {children}
              </li>
            );
          },
          p({ node, children, ...props }: any) {
            return (
              <p className="my-2 leading-relaxed" {...props}>
                {children}
              </p>
            );
          },
          h1({ node, children, ...props }: any) {
            return (
              <h1 className="text-xl font-bold my-3" {...props}>
                {children}
              </h1>
            );
          },
          h2({ node, children, ...props }: any) {
            return (
              <h2 className="text-lg font-bold my-2" {...props}>
                {children}
              </h2>
            );
          },
          h3({ node, children, ...props }: any) {
            return (
              <h3 className="text-base font-bold my-2" {...props}>
                {children}
              </h3>
            );
          },
          blockquote({ node, children, ...props }: any) {
            return (
              <blockquote
                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-3"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          hr({ ...props }) {
            return (
              <hr
                className="my-4 border-gray-300 dark:border-gray-600"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
