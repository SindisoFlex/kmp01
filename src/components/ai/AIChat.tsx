
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

// Sample FAQ responses
const faqResponses: Record<string, string> = {
  "booking": "You can book a photography session through our Services page or directly from your dashboard if you're logged in.",
  "price": "Our pricing varies based on the type of session. Basic portrait sessions start at R800, while wedding packages start at R8000. You can find detailed pricing on our Services page.",
  "reschedule": "You can reschedule your booking up to 48 hours before the scheduled time without any fees. Just log into your dashboard and use the reschedule option.",
  "cancel": "Cancellation policies depend on how far in advance you cancel. Please check our refund policy for specific details.",
  "payment": "We accept various payment methods including EFT, cash, and online payments via card.",
  "gallery": "Your photos will be available in your personal gallery after processing, usually within 5-10 business days.",
  "download": "Yes, you can download your photos directly from your gallery. The number of downloads depends on your membership tier.",
  "editing": "Basic editing is included in all packages. Premium editing services are available for an additional fee or included in higher-tier memberships.",
  "location": "We can do photoshoots at our studio or at a location of your choice within the city limits. Travel fees may apply for locations beyond 20km.",
  "duration": "Most sessions last between 1-2 hours, but wedding photography can extend to 8-10 hours depending on your package."
};

// Smart prompts based on user behavior or context
const smartPrompts = [
  "Would you like to book a photography session?",
  "Have you checked our special offers for members?",
  "Need help navigating your gallery?",
  "Looking for information on our refund policy?",
  "Interested in upgrading your membership tier?"
];

interface AIAssistantProps {
  initialOpen?: boolean;
}

const AIChat: React.FC<AIAssistantProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [currentPrompt, setCurrentPrompt] = useState("");

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: "Hello! I'm Kasilam Media production's AI assistant. How can I help you today?",
          sender: "bot",
          timestamp: new Date()
        }
      ]);

      // Set a random smart prompt
      const randomPrompt = smartPrompts[Math.floor(Math.random() * smartPrompts.length)];
      setCurrentPrompt(randomPrompt);
    }
  }, [messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process user message and generate response
  const processMessage = (userMessage: string) => {
    setIsTyping(true);

    // Create a small delay to simulate processing
    setTimeout(() => {
      let botResponse = "I'm not sure about that. Would you like me to connect you with a human assistant?";

      // Check for keyword matches in FAQs
      const lowercaseMsg = userMessage.toLowerCase();
      const matchedKey = Object.keys(faqResponses).find(key =>
        lowercaseMsg.includes(key)
      );

      if (matchedKey) {
        botResponse = faqResponses[matchedKey];
      } else if (
        lowercaseMsg.includes("hello") ||
        lowercaseMsg.includes("hi") ||
        lowercaseMsg.includes("hey")
      ) {
        botResponse = "Hello there! How can I help you with Kasilam Media production services today?";
      } else if (lowercaseMsg.includes("thanks") || lowercaseMsg.includes("thank you")) {
        botResponse = "You're welcome! Is there anything else I can help you with?";
      } else if (lowercaseMsg.includes("human") || lowercaseMsg.includes("person") || lowercaseMsg.includes("agent")) {
        botResponse = "I'll notify our team to get in touch with you soon. In the meantime, is there anything else I can help you with?";
        // Notify admin about user requesting human assistance
        toast({
          title: "Customer Service Alert",
          description: "A user has requested human assistance.",
        });
      } else if (lowercaseMsg.includes("book") || lowercaseMsg.includes("appointment") || lowercaseMsg.includes("session")) {
        botResponse = "Great! You can book a session through our Services page. Would you like me to guide you there?";
      } else if (lowercaseMsg.includes("membership") || lowercaseMsg.includes("tier") || lowercaseMsg.includes("benefits")) {
        botResponse = "Our membership program offers great benefits like discounts and extended gallery access. You can check all the details on our Membership page.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: botResponse,
          sender: "bot",
          timestamp: new Date()
        }
      ]);

      setIsTyping(false);

      // Set a new smart prompt
      const newPrompt = smartPrompts[Math.floor(Math.random() * smartPrompts.length)];
      setCurrentPrompt(newPrompt);
    }, 1000);
  };

  // Handle sending a message
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    processMessage(input);
  };

  // Handle using a smart prompt
  const handleUsePrompt = () => {
    if (!currentPrompt) return;

    setInput(currentPrompt);
    const promptElement = document.getElementById('chat-input');
    promptElement?.focus();
  };

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={toggleChat}
          className="rounded-full size-14 shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90"
        >
          <Bot className="size-6" />
        </Button>
      ) : (
        <Card className="w-80 sm:w-96 h-[500px] flex flex-col shadow-xl border-primary/20">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-primary/20">
                <AvatarFallback className="text-primary">AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-medium">Kasilam Media production Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-muted">
                  <span className="inline-block animate-pulse">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Prompt */}
          {currentPrompt && (
            <div className="px-3 py-2 border-t border-border">
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground flex-1">
                  <span className="font-medium">Try asking:</span> {currentPrompt}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUsePrompt}
                  className="text-xs h-7"
                >
                  Use
                </Button>
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t flex items-center space-x-2">
            <Textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AIChat;
