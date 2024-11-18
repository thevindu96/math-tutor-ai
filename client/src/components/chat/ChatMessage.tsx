import { useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import katex from "katex";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      // Process math expressions
      const mathElements = messageRef.current.querySelectorAll(".math");
      mathElements.forEach((elem) => {
        try {
          const tex = elem.textContent || "";
          katex.render(tex, elem as HTMLElement, {
            throwOnError: false,
            displayMode: true,
          });
        } catch (error) {
          console.error("KaTeX rendering error:", error);
        }
      });

      // Process code blocks
      const codeBlocks = messageRef.current.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [content]);

  const processContent = (text: string) => {
    // Convert markdown-style math blocks to HTML
    let processed = text.replace(/\$\$(.*?)\$\$/g, '<div class="math">$1</div>');
    
    // Convert inline math
    processed = processed.replace(/\$(.*?)\$/g, '<span class="math">$1</span>');
    
    // Convert code blocks with language
    processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => 
      `<pre><code class="${lang || ''}">${code.trim()}</code></pre>`
    );
    
    // Convert single line code
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return processed;
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
        className="flex-1 prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: processContent(content) }}
      />
    </div>
  );
}
