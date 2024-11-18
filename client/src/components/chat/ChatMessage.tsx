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
      // Process all math elements
      const mathElements = messageRef.current.querySelectorAll('[data-tex]');
      mathElements.forEach((elem) => {
        try {
          const tex = elem.getAttribute('data-tex') || '';
          const isDisplay = elem.classList.contains('math-display');
          katex.render(tex, elem as HTMLElement, {
            displayMode: isDisplay,
            throwOnError: false,
            strict: false,
            output: 'html',
            trust: true
          });
        } catch (error) {
          console.error('KaTeX error:', error);
          // Keep the original LaTeX visible if rendering fails
          elem.textContent = `$${elem.getAttribute('data-tex')}$`;
        }
      });

      // Process code blocks
      messageRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [content]);

  const processContent = (text: string) => {
    try {
      // Store math expressions temporarily
      const mathExpressions: { id: string; tex: string; display: boolean }[] = [];
      let processedContent = text;
      let counter = 0;

      // Function to replace math with placeholders
      const replaceMathWithPlaceholder = (match: string, tex: string, display: boolean) => {
        const id = `math-${counter++}`;
        mathExpressions.push({ id, tex, display });
        return `{{${id}}}`;
      };

      // Replace display math first ($$...$$)
      processedContent = processedContent.replace(/\$\$(.*?)\$\$/gs, (match, tex) => 
        replaceMathWithPlaceholder(match, tex, true)
      );

      // Replace inline math ($...$)
      processedContent = processedContent.replace(/\$([^$]+)\$/g, (match, tex) =>
        replaceMathWithPlaceholder(match, tex, false)
      );

      // Parse markdown
      let htmlContent = marked.parse(processedContent, {
        gfm: true,
        breaks: true
      });

      // Restore math expressions
      mathExpressions.forEach(({ id, tex, display }) => {
        const placeholder = `{{${id}}}`;
        const mathHtml = `<div class="${display ? 'math-display' : 'math-inline'}" data-tex="${tex.replace(/"/g, '&quot;')}"></div>`;
        htmlContent = htmlContent.replace(placeholder, mathHtml);
      });

      return htmlContent;
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
