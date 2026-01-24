import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import fs from "fs/promises";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getDocContent(slug: string) {
  const docsDirectory = path.join(process.cwd(), "docs");
  
  // Read all files and find the matching one (case-insensitive)
  const files = await fs.readdir(docsDirectory);
  const matchingFile = files.find(
    file => file.toLowerCase() === `${slug}.md`.toLowerCase()
  );
  
  if (!matchingFile) {
    throw new Error(`File not found for slug: ${slug}`);
  }
  
  const filePath = path.join(docsDirectory, matchingFile);
  const content = await fs.readFile(filePath, "utf-8");
  return content;
}

async function getAllDocSlugs() {
  const docsDirectory = path.join(process.cwd(), "docs");
  const files = await fs.readdir(docsDirectory);
  return files
    .filter(file => file.endsWith(".md"))
    .map(file => file.replace(".md", "").toLowerCase());
}

export async function generateStaticParams() {
  const slugs = await getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function DocViewPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getDocContent(slug);

  if (!content) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/docs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <code className="text-xs bg-muted px-2 py-1 rounded">
            docs/{slug === "readme" ? "README" : slug}.md
          </code>
        </div>
      </div>

      <Card className="p-8">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ ...props }) => (
                <h1 className="text-4xl font-bold mb-4 pb-2 border-b" {...props} />
              ),
              h2: ({ ...props }) => (
                <h2 className="text-3xl font-semibold mt-8 mb-4 pb-2 border-b" {...props} />
              ),
              h3: ({ ...props }) => (
                <h3 className="text-2xl font-semibold mt-6 mb-3" {...props} />
              ),
              h4: ({ ...props }) => (
                <h4 className="text-xl font-semibold mt-4 mb-2" {...props} />
              ),
              p: ({ ...props }) => (
                <p className="mb-4 leading-7" {...props} />
              ),
              ul: ({ ...props }) => (
                <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
              ),
              li: ({ ...props }) => (
                <li className="ml-4" {...props} />
              ),
              code: ({ inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg my-4"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ ...props }) => (
                <pre className="overflow-x-auto" {...props} />
              ),
              table: ({ ...props }) => (
                <div className="overflow-x-auto my-6">
                  <table className="min-w-full border-collapse border border-border" {...props} />
                </div>
              ),
              thead: ({ ...props }) => (
                <thead className="bg-muted" {...props} />
              ),
              th: ({ ...props }) => (
                <th className="border border-border px-4 py-2 text-left font-semibold" {...props} />
              ),
              td: ({ ...props }) => (
                <td className="border border-border px-4 py-2" {...props} />
              ),
              blockquote: ({ ...props }) => (
                <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic bg-muted/50" {...props} />
              ),
              a: ({ href, ...props }) => {
                // Check if it's an internal link to code
                if (href?.startsWith("../")) {
                  const cleanHref = href.replace("../", "/");
                  return (
                    <a
                      href={cleanHref}
                      className="text-primary hover:underline font-mono text-sm"
                      {...props}
                    />
                  );
                }
                return (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                    {...props}
                  />
                );
              },
              hr: ({ ...props }) => (
                <hr className="my-8 border-border" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </Card>

      <div className="mt-6 flex justify-center">
        <Link href="/docs">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Button>
        </Link>
      </div>
    </div>
  );
}
