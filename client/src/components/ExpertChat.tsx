import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, Bot, User, BookOpen, ChevronRight, Activity, Brain, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { chatAPI } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface Citation {
  sourceId: string;
  title: string;
  excerpt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  fullContent: string;
  streaming?: boolean;
  timestamp: Date;
  citations?: Citation[];
  suggestedFollowUps?: string[];
  contextUsed?: string[];
}

const TYPEWRITER_SPEED_MS = 12;

export const ExpertChat = () => {
  const { t, locale } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const makeWelcomeMsg = (): Message => ({
    id: 'welcome',
    role: 'assistant',
    content: t.welcomeMessage,
    fullContent: t.welcomeMessage,
    timestamp: new Date(),
  });

  const startTypewriter = useCallback((messageId: string, fullContent: string) => {
    if (typewriterRef.current) clearInterval(typewriterRef.current);

    let index = 0;
    typewriterRef.current = setInterval(() => {
      index += 3; // reveal 3 chars per tick for a reasonable speed
      const revealed = fullContent.slice(0, index);
      const done = index >= fullContent.length;
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, content: done ? fullContent : revealed, streaming: !done }
            : m
        )
      );
      if (done) {
        clearInterval(typewriterRef.current!);
        typewriterRef.current = null;
      }
    }, TYPEWRITER_SPEED_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, []);

  const { data: conversationId, isLoading: convLoading } = useQuery({
    queryKey: ['chat', 'conversation'],
    queryFn: async () => {
      const conversations = await chatAPI.getConversations();
      const conv = conversations[0] || await chatAPI.createConversation({ title: 'Expert Chat', topic: 'general' });
      return conv.id;
    },
    staleTime: Infinity,
  });

  const { isLoading: msgsLoading } = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const apiMessages = await chatAPI.getMessages(conversationId!);
      if (apiMessages.length > 0) {
        const mapped: Message[] = apiMessages.map((m) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: m.content,
          fullContent: m.content,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(mapped);
        return mapped;
      }
      const welcome = makeWelcomeMsg();
      setMessages([welcome]);
      return [welcome];
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (messageText: string) => {
      return chatAPI.sendMessage(conversationId!, messageText);
    },
    onMutate: (messageText: string) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        fullContent: messageText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
    },
    onSuccess: (response) => {
      const metadata = response.assistantMessage.metadata as Record<string, any> | null;
      const msgId = response.assistantMessage.id;
      const fullContent = response.assistantMessage.content;

      const assistantMessage: Message = {
        id: msgId,
        role: 'assistant',
        content: '',
        fullContent,
        streaming: true,
        timestamp: new Date(response.assistantMessage.createdAt),
        citations: response.assistantMessage.citations as Citation[] ?? [],
        suggestedFollowUps: metadata?.suggestedFollowUps ?? [],
        contextUsed: metadata?.contextUsed ?? [],
      };
      setMessages(prev => [...prev, assistantMessage]);
      startTypewriter(msgId, fullContent);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.context?.json?.error || error?.context?.json?.message || t.errorFallback;
      console.error('Expert chat send error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        fullContent: errorMessage,
        timestamp: new Date(),
      }]);
    },
  });

  const handleSend = useCallback(() => {
    if (!input.trim() || !conversationId || sendMutation.isPending) return;
    const text = input.trim();
    setInput('');
    sendMutation.mutate(text);
  }, [input, conversationId, sendMutation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = useCallback(() => {
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    setMessages([makeWelcomeMsg()]);
    setInput('');
  }, [makeWelcomeMsg]);

  const lastAssistantMsgId = useMemo(() => {
    const assistantMsgs = messages.filter(m => m.role === 'assistant' && !m.streaming);
    return assistantMsgs[assistantMsgs.length - 1]?.id ?? null;
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pb-16">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
        <div className="relative shrink-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold">Myora AI</h1>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t.expertSubtitle ?? 'Çevrimiçi · Yanıt veriyor'}</p>
        </div>
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs gap-1.5 text-muted-foreground"
            onClick={handleClearChat}
            title={t.newConversation ?? 'New conversation'}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t.newConversation ?? 'New chat'}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4" ref={scrollRef}>
        <div className="space-y-4 py-4 max-w-lg mx-auto">
          {messages.map((message) => (
            <div key={message.id} className="space-y-1.5">
              <div className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarFallback
                    className={
                      message.role === "assistant"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                    {message.streaming && (
                      <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
                    )}
                  </p>

                  {!message.streaming && message.role === "assistant" && message.contextUsed && message.contextUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.contextUsed.map((ctx) => (
                        <Badge key={ctx} variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 bg-background/50">
                          {ctx}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {!message.streaming && message.role === "assistant" && message.citations && message.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/30 space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {t.sources}
                      </p>
                      {message.citations.map((citation, idx) => (
                        <div key={idx} className="text-[11px] text-muted-foreground leading-tight">
                          <span className="font-semibold">[{idx + 1}]</span> {citation.title}
                          {citation.excerpt && (
                            <span className="italic"> — {citation.excerpt.slice(0, 80)}{citation.excerpt.length > 80 ? '…' : ''}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-muted-foreground/60 mt-1.5 block">
                    {message.timestamp.toLocaleTimeString(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {!message.streaming && message.role === "assistant" && message.id === lastAssistantMsgId && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
                <div className="ml-10 flex flex-wrap gap-1.5">
                  {message.suggestedFollowUps.map((followUp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(followUp)}
                      className="text-xs bg-primary/5 hover:bg-primary/10 text-primary border border-primary/15 rounded-full px-3 py-1 transition-colors flex items-center gap-1"
                    >
                      <ChevronRight className="h-3 w-3" />
                      {followUp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {sendMutation.isPending && (
            <div className="flex gap-2.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-muted">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background">
        {/* #11 Starter Chips — visible only when chat is empty */}
        {messages.length <= 1 && !sendMutation.isPending && (
          <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-hide max-w-lg mx-auto">
            {([
              t.chatStarterWater ?? 'How much water daily?',
              t.chatStarterProtein ?? 'High-protein foods?',
              t.chatStarterCalories ?? 'How many calories?',
              t.chatStarterSleep ?? 'Sleep & weight loss?',
              t.chatStarterFast ?? 'Intermittent fasting?',
            ] as string[]).map((chip) => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="shrink-0 text-[11px] font-medium border border-border rounded-full px-3 py-1.5 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 max-w-lg mx-auto px-4 py-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t.askHealthQuestion}
            disabled={sendMutation.isPending || !conversationId || convLoading || msgsLoading}
            className="rounded-full px-4"
            data-testid="input-chat"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending || !conversationId}
            size="icon"
            className="rounded-full shrink-0"
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground pb-2 text-center">
          {t.expertDisclaimer}
        </p>
      </div>
    </div>
  );
};
