import { useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import katex from "katex";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { marked } from 'marked';

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      // Process display math
      const displayMath = messageRef.current.querySelectorAll('.math-display');
      displayMath.forEach((elem) => {
        try {
          katex.render(elem.textContent || '', elem as HTMLElement, {
            displayMode: true,
            throwOnError: false,
            strict: false
          });
        } catch (error) {
          console.error('KaTeX error:', error);
        }
      });

      // Process inline math
      const inlineMath = messageRef.current.querySelectorAll('.math-inline');
      inlineMath.forEach((elem) => {
        try {
          katex.render(elem.textContent || '', elem as HTMLElement, {
            displayMode: false,
            throwOnError: false,
            strict: false
          });
        } catch (error) {
          console.error('KaTeX error:', error);
        }
      });

      // Process code blocks
      messageRef.current.querySelectorAll("pre code").forEach(block => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [content]);

  const processContent = (text: string) => {
    // First convert any LaTeX delimiters to standardized format
    let processed = text.replace(/\\[(.*?)\\]/g, '$$$$1$$');
    processed = processed.replace(/\\((.*?)\\)/g, '$$1$');
    
    // Then parse with marked
    return marked.parse(processed, {
      gfm: true,
      breaks: true
    });
  };

  return (
    <div className={cn(
      "flex gap-4 p-4",
      role === "assistant" ? "bg-muted/50" : "bg-background"
    )}>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        {role === "user" ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>
      <div 
        ref={messageRef}
        className="flex-1 prose prose-sm dark:prose-invert max-w-none overflow-x-hidden"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: processContent(content) }}
      />
    </div>
  );
}