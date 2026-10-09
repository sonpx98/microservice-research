import Image from 'next/image';
import Link from 'next/link';

type MDXComponents = {
  [key: string]: React.ComponentType<any>;
};

export const mdxComponents: MDXComponents = {
  h1: ({ children, ...props }) => (
    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-6 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="leading-7 mb-4" {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, ...props }) => (
    <Link 
      href={href as string} 
      className="text-primary underline underline-offset-4 hover:text-primary/80"
      {...props}
    >
      {children}
    </Link>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="mt-6 border-l-4 border-primary pl-6 italic" {...props}>
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre className="mb-4 mt-6 overflow-x-auto rounded-lg bg-muted p-4" {...props}>
      {children}
    </pre>
  ),
  img: ({ src, alt, ...props }) => (
    <Image 
      src={src as string} 
      alt={alt as string}
      width={800}
      height={400}
      className="rounded-lg my-4"
      {...props}
    />
  ),
};
