"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, X, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface AIChatProps {
  userId: Id<"users">;
  sessionId?: Id<"sessions"> | null;
  onClose?: () => void;
}

export default function AIChat({ userId, sessionId, onClose }: AIChatProps) {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.aiChat.getChatMessages, { userId, limit: 50 });
  const sendMessage = useAction(api.aiChat.sendChatMessage);
  const clearChat = useMutation(api.aiChat.clearChatHistory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const userMessage = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      await sendMessage({
        userId,
        message: userMessage,
        sessionId: sessionId || undefined,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(userMessage); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    if (confirm("Clear all chat history? This cannot be undone.")) {
      try {
        await clearChat({ userId });
      } catch (error) {
        console.error("Failed to clear chat:", error);
      }
    }
  };

  return (
    <Card className={`flex flex-col border-2 border-electric-purple/30 ${isExpanded ? 'fixed inset-4 z-50' : 'h-[600px]'}`}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-electric-purple" />
          AI Goon Coach Chat
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="h-8 w-8 p-0 hover:text-red-500"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {!messages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-electric-purple" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Bot className="w-12 h-12 text-electric-purple mb-3 opacity-50" />
              <p className="text-sm text-gray-400 mb-2">
                Start a conversation with your AI Goon Coach
              </p>
              <p className="text-xs text-gray-500">
                Get personalized advice, motivation, and real-time coaching during your sessions
              </p>
            </div>
          ) : (
            <>
              {messages.slice().reverse().map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-electric-indigo text-white"
                        : "glass-panel border border-electric-purple/20"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg._creationTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your coach anything..."
            disabled={isSending}
            className="flex-1 bg-white/5 border-white/10 focus:border-electric-purple/50"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="bg-electric-purple hover:bg-electric-purple/90"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {sessionId && (
          <div className="text-xs text-center text-gray-500">
            💪 In-session coaching active
          </div>
        )}
      </CardContent>
    </Card>
  );
}
