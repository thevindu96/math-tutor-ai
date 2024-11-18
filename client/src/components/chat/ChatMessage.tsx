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
      // Create a temporary div to help with processing
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = marked.parse(text);

      // Process all text nodes to find and convert math delimiters
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const content = node.textContent || '';
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          
          // Function to create math element
          const createMathElement = (tex: string, isDisplay: boolean) => {
            const mathElem = document.createElement(isDisplay ? 'div' : 'span');
            mathElem.className = isDisplay ? 'math-display' : 'math-inline';
            mathElem.textContent = tex;
            return mathElem;
          };

          // Find all math expressions
          const mathRegex = /(\$\$[^\$]+\$\$|\$[^\$]+\$)/g;
          let match;
          
          while ((match = mathRegex.exec(content)) !== null) {
            // Add text before math
            if (match.index > lastIndex) {
              fragment.appendChild(document.createTextNode(content.slice(lastIndex, match.index)));
            }
            
            // Process math expression
            const isDisplay = match[0].startsWith('$$');
            const tex = match[0].slice(isDisplay ? 2 : 1, -(isDisplay ? 2 : 1));
            fragment.appendChild(createMathElement(tex, isDisplay));
            
            lastIndex = match.index + match[0].length;
          }
          
          // Add remaining text
          if (lastIndex < content.length) {
            fragment.appendChild(document.createTextNode(content.slice(lastIndex)));
          }
          
          node.parentNode?.replaceChild(fragment, node);
        } else {
          // Recursively process child nodes
          Array.from(node.childNodes).forEach(processNode);
        }
      };

      processNode(tempDiv);
      return tempDiv.innerHTML;
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
