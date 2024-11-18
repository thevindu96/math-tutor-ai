import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import type { Message } from "@/pages/ChatPage";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea 
      ref={scrollRef} 
      className="flex-1 overflow-y-auto"
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Start the conversation by asking a math question
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))
      )}
    </ScrollArea>
  );
}
