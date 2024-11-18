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
      const renderMathElement = (elem: Element, displayMode: boolean) => {
        try {
          const tex = elem.textContent || "";
          katex.render(tex, elem as HTMLElement, {
            throwOnError: false,
            displayMode,
            strict: false
          });
        } catch (error) {
          console.error("KaTeX rendering error:", error);
          elem.textContent = elem.textContent || "";
        }
      };

      // Process display math
      messageRef.current.querySelectorAll(".math-display").forEach(elem => 
        renderMathElement(elem, true)
      );

      // Process inline math
      messageRef.current.querySelectorAll(".math-inline").forEach(elem => 
        renderMathElement(elem, false)
      );

      // Process code blocks
      messageRef.current.querySelectorAll("pre code").forEach(block => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [content]);

  const processContent = (text: string) => {
    try {
      // Remove duplicate expressions first using non-greedy matching
      let processed = text.replace(/(\$[^\$]+\$)()+/g, '$1');
      processed = processed.replace(/(\$\$[^\$]+\$\$)()+/g, '$1');
      
      // Handle LaTeX delimiters with proper escaping
      processed = processed.replace(/\\\[(.*?)\\\]/g, '$$$$1$$');
      processed = processed.replace(/\\\((.*?)\\\)/g, '$$1$');
      
      // Process math expressions with non-greedy matching
      processed = processed.replace(/\$\$([^$]*?)\$\$/g, '<div class="math-display">$1</div>');
      processed = processed.replace(/\$([^$]*?)\$/g, '<span class="math-inline">$1</span>');
      
      // Parse markdown
      return marked.parse(processed, {
        gfm: true,
        breaks: true
      });
    } catch (error) {
      console.error('Error processing content:', error);
      return text;
    }
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
